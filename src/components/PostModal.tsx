import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { Post } from "./PostsList";
import { gql, useMutation } from "@apollo/client";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post?: Post | null;
}

const SAVE_POST_MUTATION = gql`
  mutation SavePost($savePostInput: SavePostDto!, $savePostId: ID) {
    savePost(savePostInput: $savePostInput, id: $savePostId) {
      id
    }
  }
`;

const REMOVE_POST_MUTATION = gql`
  mutation RemovePost($id: ID!) {
    removePost(id: $id) {
      id
    }
  }
`;

export default function PostModal({ isOpen, onClose, post }: PostModalProps) {
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [materials, setMaterials] = useState<
    { name: string; link: string; type: string }[]
  >([]);

  const handleMaterialChange = (
    index: number,
    field: keyof (typeof materials)[0],
    value: string
  ) => {
    const updated = materials.map((material) => ({ ...material }));
    updated[index][field] = value;
    setMaterials(updated);
  };

  useEffect(() => {
    if (post) {
      setSubject(post.subject || "");
      setTitle(post.title || "");
      setDescription(post.description || "");
      setTags(post.tags?.join(",") || "");
      setMaterials(post.materials ?? []);
    } else {
      setSubject("");
      setTitle("");
      setDescription("");
      setTags("");
      setMaterials([]);
    }
  }, [post]);

  const [token] = useLocalStorage<string>("token");

  const [savePost] = useMutation(SAVE_POST_MUTATION, {
    context: {
      headers: {
        Authorization: token,
      },
    },
    onCompleted: () => {
      toast.success("Publicação criada com sucesso");
      onClose();
    },
    onError: () => {
      toast.error("Erro ao criar publicação");
    },
  });

  const [removePost] = useMutation(REMOVE_POST_MUTATION, {
    context: {
      headers: {
        Authorization: token,
      },
    },
    onCompleted: () => {
      toast.success("Publicação removida com sucesso");
      onClose();
    },
    onError: () => {
      toast.error("Erro ao remover publicação");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading("Publicando...");

    savePost({
      variables: {
        savePostId: post?.id,
        savePostInput: {
          subject,
          title,
          description,
          tags: tags.split(",").map((t) => t.trim()),
          materials:
            materials.length > 0
              ? materials.map(({ name, link, type }) => ({
                  name,
                  link,
                  type,
                }))
              : undefined,
        },
      },
    }).finally(() => toast.dismiss(toastId));
  };

  const handleRemovePost = () => {
    if (post?.id) {
      const toastId = toast.loading("Removendo...");

      removePost({
        variables: { id: post.id },
      }).finally(() => toast.dismiss(toastId));
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const addMaterial = () => {
    if (materials.length < 3) {
      setMaterials([...materials, { name: "", link: "", type: "" }]);
    }
  };

  const removeMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  console.log(materials);

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
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
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
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explique sua dúvida de forma clara e objetiva."
              className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 h-32 resize-none"
              required
            />
          </div>

          {materials.map((material, index) => (
            <div key={index} className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-black mb-2">
                    Nome do Material*
                  </label>
                  <input
                    type="text"
                    value={material.name}
                    onChange={(e) =>
                      handleMaterialChange(index, "name", e.target.value)
                    }
                    placeholder="Ex: Exercícios de Trigonometria"
                    className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    required
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-black mb-2">
                    Link*
                  </label>
                  <input
                    type="url"
                    value={material.link}
                    onChange={(e) =>
                      handleMaterialChange(index, "link", e.target.value)
                    }
                    placeholder="URL do material"
                    className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    required
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-black mb-2">
                    Tipo*
                  </label>
                  <select
                    value={material.type}
                    onChange={(e) =>
                      handleMaterialChange(index, "type", e.target.value)
                    }
                    className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    required
                  >
                    <option value="">Selecione o tipo de material</option>
                    <option value="ARTICLE">Artigo</option>
                    <option value="EXERCISE">Exercícios</option>
                    <option value="PODCAST">Podcast</option>
                    <option value="SUMMARY">Resumo</option>
                    <option value="SIMULATOR">Simulado</option>
                    <option value="VIDEO">Vídeo</option>
                    <option value="OTHER">Outro</option>
                  </select>
                </div>
              </div>
              <button
                type="button"
                className="text-[#990000] text-sm shadow-md p-2 hover:bg-gray-200 rounded-lg"
                onClick={() => removeMaterial(index)}
              >
                Remover material
              </button>
            </div>
          ))}

          {materials.length < 3 && (
            <button
              type="button"
              className="text-[#990000] text-sm shadow-md p-2 hover:bg-gray-200 rounded-lg"
              onClick={addMaterial}
            >
              Adicionar material
            </button>
          )}

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Tags<span className="text-red-500"> *</span>
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Ex: Matemática, Estatística"
              className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              required
            />
          </div>

          <div className="flex justify-end pt-4 gap-4">
            {post && (
              <button
                type="button"
                className="bg-[#990000] text-white py-2 px-6 rounded-lg hover:bg-[#B22222] transition duration-300"
                onClick={handleRemovePost}
              >
                Remover Publicação
              </button>
            )}
            <button
              type="submit"
              className="bg-[#990000] text-white py-2 px-6 rounded-lg hover:bg-[#B22222] transition duration-300"
            >
              {post ? "Atualizar" : "Publicar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
