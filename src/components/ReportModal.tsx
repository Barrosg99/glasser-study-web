import { useLocalStorage } from "@/hooks/useLocalStorage";
import { gql, useMutation } from "@apollo/client";
import React, { useState, useCallback } from "react";
import { toast } from "react-hot-toast";

type ReportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  entity: { id: string; name: string };
};

const CREATE_REPORT_MUTATION = gql`
  mutation CreateReport($saveReportDto: SaveReportDto!) {
    createReport(saveReportDto: $saveReportDto) {
      id
    }
  }
`;

const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  entity,
}) => {
  const [token] = useLocalStorage<string>("token");
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");

  const [createReport, { loading }] = useMutation(CREATE_REPORT_MUTATION, {
    variables: {
      saveReportDto: {
        entity: entity.name,
        entityId: entity.id,
        reason,
        description: details,
      },
    },
    context: {
      headers: {
        Authorization: token,
      },
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createReport();
      setReason("");
      setDetails("");
      onClose();
      toast.success("Denúncia enviada com sucesso.");
    } catch {
      toast.error("Erro ao enviar denúncia.");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        zIndex: 1000,
        left: 0,
        top: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "black",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 8,
          padding: 24,
          minWidth: 320,
          maxWidth: 400,
          boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            right: 12,
            top: 12,
            background: "none",
            border: "none",
            fontSize: 20,
            cursor: "pointer",
          }}
          aria-label="Fechar"
        >
          ×
        </button>
        <h2 style={{ marginBottom: 16, fontSize: 20 }}>Denunciar</h2>
        <form onSubmit={handleSubmit}>
          <label style={{ display: "block", marginBottom: 8 }}>
            Motivo
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              style={{
                width: "100%",
                marginTop: 4,
                marginBottom: 12,
                padding: 6,
              }}
            >
              <option value="">Selecione...</option>
              <option value="spam">Spam</option>
              <option value="ofensivo">Conteúdo ofensivo</option>
              <option value="incorreto">Informação incorreta</option>
              <option value="outro">Outro</option>
            </select>
          </label>
          <label style={{ display: "block", marginBottom: 8 }}>
            Detalhes (opcional)
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              style={{
                width: "100%",
                marginTop: 4,
                marginBottom: 12,
                padding: 6,
                resize: "vertical",
              }}
              placeholder="Descreva o motivo da denúncia"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "8px 0",
              background: "#171717",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Enviando..." : "Enviar denúncia"}
          </button>
        </form>
      </div>
    </div>
  );
};

export function useReportModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [entity, setEntity] = useState<{ id: string; name: string }>({
    id: "",
    name: "",
  });

  const open = useCallback(({ id, name }: { id: string; name: string }) => {
    setIsOpen(true);
    setEntity({ id, name });
  }, []);
  const close = useCallback(() => setIsOpen(false), []);

  const modal = <ReportModal isOpen={isOpen} onClose={close} entity={entity} />;

  return { open, close, modal };
}

export default ReportModal;