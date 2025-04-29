import { X } from "lucide-react";
import { useState } from "react";

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    subject: string;
    title: string;
    description: string;
    tags: string[];
    materials?: {
      name: string;
      link: string;
      type: string;
    }[];
  }) => void;
}

export default function PostModal({
  isOpen,
  onClose,
  onSubmit,
}: PostModalProps) {
  const [showMaterialFields, setShowMaterialFields] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const materials = showMaterialFields
      ? [
          {
            name: formData.get("materialName") as string,
            link: formData.get("materialLink") as string,
            type: formData.get("materialType") as string,
          },
        ]
      : undefined;

    onSubmit({
      subject: formData.get("subject") as string,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      tags: (formData.get("tags") as string)
        .split(",")
        .map((tag) => tag.trim()),
      materials,
    });
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg p-10 w-full max-w-3xl relative max-h-[90vh] ">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 text-black overflow-y-auto max-h-[calc(90vh-3rem)] scrollbar-hide"
        >
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-black mb-2">
                Disciplina<span className="text-red-500"> *</span>
              </label>
              <input
                type="text"
                name="subject"
                placeholder="Ex: Matemática, Biologia"
                className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                required
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-black mb-2">
                Título<span className="text-red-500"> *</span>
              </label>
              <input
                type="text"
                name="title"
                placeholder="Ex: Como calcular o desvio padrão?"
                className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Descrição<span className="text-red-500"> *</span>
            </label>
            <textarea
              name="description"
              placeholder="Explique sua dúvida de forma clara e objetiva."
              className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 h-32 resize-none"
              required
            />
          </div>

          <button
            type="button"
            className="text-[#990000] text-sm shadow-md p-2 hover:bg-gray-200 rounded-lg"
            onClick={() => setShowMaterialFields(true)}
          >
            Adicionar material
          </button>

          {showMaterialFields && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-black mb-2">
                    Nome do Material*
                  </label>
                  <input
                    type="text"
                    name="materialName"
                    placeholder="Ex: Exercícios de Trigonometria"
                    className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    required={showMaterialFields}
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-black mb-2">
                    Link*
                  </label>
                  <input
                    type="url"
                    name="materialLink"
                    placeholder="URL do material"
                    className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    required={showMaterialFields}
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-black mb-2">
                    Tipo*
                  </label>
                  <select
                    name="materialType"
                    className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    required={showMaterialFields}
                  >
                    <option value="">Selecione o tipo de material</option>
                    <option value="document">Documento</option>
                    <option value="video">Vídeo</option>
                    <option value="exercise">Exercício</option>
                    <option value="article">Artigo</option>
                    <option value="other">Outro</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Tags<span className="text-red-500"> *</span>
            </label>
            <input
              type="text"
              name="tags"
              placeholder="Ex: Matemática, Estatística"
              className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              required
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="bg-[#990000] text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Publicar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
