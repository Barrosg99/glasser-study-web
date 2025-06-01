import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { Post } from "./PostsList";
import { gql, useMutation } from "@apollo/client";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getDictionary } from "@/dictionaries";

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post?: Post | null;
  dictionary: Awaited<ReturnType<typeof getDictionary>>["posts"]["modal"];
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

export default function PostModal({
  isOpen,
  onClose,
  post,
  dictionary,
}: PostModalProps) {
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
      toast.success(
        post ? dictionary.toast.updateSuccess : dictionary.toast.createSuccess
      );
      onClose();
    },
    onError: () => {
      toast.error(
        post ? dictionary.toast.updateError : dictionary.toast.createError
      );
    },
  });

  const [removePost] = useMutation(REMOVE_POST_MUTATION, {
    context: {
      headers: {
        Authorization: token,
      },
    },
    onCompleted: () => {
      toast.success(dictionary.toast.removeSuccess);
      onClose();
    },
    onError: () => {
      toast.error(dictionary.toast.removeError);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading(
      post ? dictionary.submit.update : dictionary.submit.create
    );

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
      const toastId = toast.loading(dictionary.submit.remove);

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
                {dictionary.subject.label}
                <span className="text-red-500"> *</span>
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                required
              >
                <option value="">{dictionary.subject.select}</option>
                <option value="MATHEMATICS">
                  {dictionary.subject.options.MATHEMATICS}
                </option>
                <option value="PORTUGUESE">
                  {dictionary.subject.options.PORTUGUESE}
                </option>
                <option value="PHYSICS">
                  {dictionary.subject.options.PHYSICS}
                </option>
                <option value="CHEMISTRY">
                  {dictionary.subject.options.CHEMISTRY}
                </option>
                <option value="BIOLOGY">
                  {dictionary.subject.options.BIOLOGY}
                </option>
                <option value="HISTORY">
                  {dictionary.subject.options.HISTORY}
                </option>
                <option value="GEOGRAPHY">
                  {dictionary.subject.options.GEOGRAPHY}
                </option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-black mb-2">
                {dictionary.title}
                <span className="text-red-500"> *</span>
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
              {dictionary.description}
              <span className="text-red-500"> *</span>
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
                    {dictionary.materials.name}*
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
                    {dictionary.materials.link}*
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
                    {dictionary.materials.type}*
                  </label>
                  <select
                    value={material.type}
                    onChange={(e) =>
                      handleMaterialChange(index, "type", e.target.value)
                    }
                    className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    required
                  >
                    <option value="">
                      {dictionary.materials.types.select}
                    </option>
                    <option value="MATHEMATICS">
                      {dictionary.materials.types.article}
                    </option>
                    <option value="PORTUGUESE">
                      {dictionary.materials.types.exercise}
                    </option>
                    <option value="PHYSICS">
                      {dictionary.materials.types.podcast}
                    </option>
                    <option value="CHEMISTRY">
                      {dictionary.materials.types.summary}
                    </option>
                    <option value="BIOLOGY">
                      {dictionary.materials.types.simulator}
                    </option>
                    <option value="HISTORY">
                      {dictionary.materials.types.video}
                    </option>
                    <option value="GEOGRAPHY">
                      {dictionary.materials.types.other}
                    </option>
                  </select>
                </div>
              </div>
              <button
                type="button"
                className="text-[#990000] text-sm shadow-md p-2 hover:bg-gray-200 rounded-lg"
                onClick={() => removeMaterial(index)}
              >
                {dictionary.materials.remove}
              </button>
            </div>
          ))}

          {materials.length < 3 && (
            <button
              type="button"
              className="text-[#990000] text-sm shadow-md p-2 hover:bg-gray-200 rounded-lg"
              onClick={addMaterial}
            >
              {dictionary.materials.add}
            </button>
          )}

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              {dictionary.tags}
              <span className="text-red-500"> *</span>
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
                {dictionary.submit.remove}
              </button>
            )}
            <button
              type="submit"
              className="bg-[#990000] text-white py-2 px-6 rounded-lg hover:bg-[#B22222] transition duration-300"
            >
              {post ? dictionary.submit.update : dictionary.submit.create}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
