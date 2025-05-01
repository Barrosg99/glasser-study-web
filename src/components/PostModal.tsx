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
  const [materials, setMaterials] = useState<
    { name: string; link: string; type: string }[]
  >([]);

  

  useEffect(() => {
    if (post) {
      setMaterials(post.materials ?? []);
    } else {
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
    const formData = new FormData(e.target as HTMLFormElement);

    const formMaterials = materials.map((material, index) => ({
      name: formData.get(`materialName${index}`) as string,
      link: formData.get(`materialLink${index}`) as string,
      type: formData.get(`materialType${index}`) as string,
    }));

    const toastId = toast.loading("Publicando...");

    savePost({
      variables: {
        savePostId: post?.id,
        savePostInput: {
          subject: formData.get("subject") as string,
          title: formData.get("title") as string,
          description: formData.get("description") as string,
          tags: (formData.get("tags") as string)
            .split(",")
            .map((tag) => tag.trim()),
          materials: formMaterials.length > 0 ? formMaterials : undefined,
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
                name="subject"
                placeholder="Ex: Matemática, Biologia"
                defaultValue={post?.subject || ""}
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
                defaultValue={post?.title || ""}
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
              defaultValue={post?.description || ""}
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
                    name={`materialName${index}`}
                    placeholder="Ex: Exercícios de Trigonometria"
                    defaultValue={material.name}
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
                    name={`materialLink${index}`}
                    placeholder="URL do material"
                    defaultValue={material.link}
                    className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    required
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-black mb-2">
                    Tipo*
                  </label>
                  <select
                    name={`materialType${index}`}
                    className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    defaultValue={material.type}
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
              name="tags"
              placeholder="Ex: Matemática, Estatística"
              defaultValue={post?.tags?.join(",") || ""}
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
