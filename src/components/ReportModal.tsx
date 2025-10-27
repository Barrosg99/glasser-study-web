"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { gql, useMutation } from "@apollo/client";
import React, { useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { useParams } from "next/navigation";

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

  const params = useParams();
  const { lang } = params;

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

      const msg =
        lang === "pt"
          ? "Denúncia enviada com sucesso."
          : "Report sent successfully.";
      toast.success(msg);
    } catch {
      const msg =
        lang === "pt" ? "Erro ao enviar denúncia." : "Error sending report.";
      toast.error(msg);
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
        <h2 style={{ marginBottom: 16, fontSize: 20 }}>
          {lang === "pt" ? "Denunciar" : "Report"}
        </h2>
        <form onSubmit={handleSubmit}>
          <label style={{ display: "block", marginBottom: 8 }}>
            {lang === "pt" ? "Motivo" : "Reason"}
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
              <option value="">
                {lang === "pt" ? "Selecione..." : "Select..."}
              </option>
              <option value="spam">{lang === "pt" ? "Spam" : "Spam"}</option>
              <option value="ofensivo">
                {lang === "pt" ? "Conteúdo ofensivo" : "Offensive content"}
              </option>
              <option value="incorreto">
                {lang === "pt"
                  ? "Informação incorreta"
                  : "Incorrect information"}
              </option>
              <option value="outro">{lang === "pt" ? "Outro" : "Other"}</option>
            </select>
          </label>
          <label style={{ display: "block", marginBottom: 8 }}>
            {lang === "pt" ? "Detalhes (opcional)" : "Details (optional)"}
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
              placeholder={
                lang === "pt"
                  ? "Descreva o motivo da denúncia"
                  : "Describe the reason for the report"
              }
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
            {loading
              ? lang === "pt"
                ? "Enviando..."
                : "Sending..."
              : lang === "pt"
              ? "Enviar denúncia"
              : "Send report"}
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
