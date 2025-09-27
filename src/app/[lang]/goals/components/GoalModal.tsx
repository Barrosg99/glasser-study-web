import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { getDictionary } from "@/dictionaries";
import type { Goal, Task } from "@/app/[lang]/goals/components/GoalsPage";
import { useMutation } from "@apollo/client";
import { DELETE_GOAL_MUTATION, SAVE_GOAL_MUTATION } from "../graphql/mutations";
import { GET_MY_GOALS } from "../graphql/queries";

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal?: Goal | null;
  dictionary: Awaited<ReturnType<typeof getDictionary>>["goals"]["modal"];
  token: string;
}

export default function GoalModal({
  isOpen,
  onClose,
  goal,
  dictionary,
  token,
}: GoalModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tasks, setTasks] = useState<Omit<Task, "completed">[]>([]);

  useEffect(() => {
    if (goal) {
      setName(goal.name || "");
      setDescription(goal.description || "");
      setTasks(
        goal.tasks.map((task) => ({
          name: task.name,
          link: task.link,
        }))
      );
    } else {
      setName("");
      setDescription("");
      setTasks([]);
    }
  }, [goal]);

  const handleTaskChange = (
    index: number,
    field: keyof Omit<Task, "id" | "completed">,
    value: string
  ) => {
    const updated = tasks.map((task) => ({ ...task }));
    updated[index][field] = value;
    setTasks(updated);
  };

  const addTask = () => {
    setTasks([...tasks, { name: "", link: "" }]);
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const [saveGoal] = useMutation(SAVE_GOAL_MUTATION, {
    context: {
      headers: {
        Authorization: token,
      },
    },
    onError: () => {
      toast.error("Erro ao salvar meta");
    },
    refetchQueries: [GET_MY_GOALS],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (tasks.length === 0 || tasks.some((task) => !task.name.trim())) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    // Validate URLs
    const invalidUrls = tasks.filter(
      (task) => task.link && !isValidUrl(task.link.trim())
    );
    if (invalidUrls.length > 0) {
      toast.error("Por favor, insira URLs válidas para as tarefas");
      return;
    }

    const goalData = {
      name: name.trim(),
      description: description.trim(),
      tasks: tasks.map((task) => ({
        name: task.name.trim(),
        link: task.link?.trim(),
        completed: false,
      })),
    };

    await saveGoal({ variables: { saveGoalDto: goalData, id: goal?.id } });

    toast.success(
      goal ? dictionary.toast.updateSuccess : dictionary.toast.createSuccess
    );
    onClose();
  };

  const [deleteGoal] = useMutation(DELETE_GOAL_MUTATION, {
    context: {
      headers: {
        Authorization: token,
      },
    },
    refetchQueries: [GET_MY_GOALS],
  });

  const handleDeleteGoal = async (goalId: string) => {
    await deleteGoal({
      variables: {
        id: goalId,
      },
    });

    toast.success(dictionary.toast.deleteSuccess);
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg p-10 w-full max-w-3xl relative max-h-[90vh]">
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
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              {dictionary.form.title.label}
              <span className="text-red-500"> *</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={dictionary.form.title.placeholder}
              className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              {dictionary.form.description.label}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={dictionary.form.description.placeholder}
              className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 h-32 resize-none"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {dictionary.form.tasks.label}
                <span className="text-red-500"> *</span>
              </h3>
              <button
                type="button"
                className="text-[#990000] text-sm shadow-md p-2 hover:bg-gray-200 rounded-lg"
                onClick={addTask}
              >
                {dictionary.form.tasks.add}
              </button>
            </div>

            {tasks.map((task, index) => (
              <div
                key={index}
                className="space-y-4 p-4 bg-gray-50 rounded-lg mb-4"
              >
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-black mb-2">
                      {dictionary.form.tasks.name.label}
                      <span className="text-red-500"> *</span>
                    </label>
                    <input
                      type="text"
                      value={task.name}
                      onChange={(e) =>
                        handleTaskChange(index, "name", e.target.value)
                      }
                      placeholder={dictionary.form.tasks.name.placeholder}
                      className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      required
                    />
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium text-black mb-2">
                      {dictionary.form.tasks.link.label}
                    </label>
                    <input
                      type="url"
                      value={task.link}
                      onChange={(e) =>
                        handleTaskChange(index, "link", e.target.value)
                      }
                      placeholder={dictionary.form.tasks.link.placeholder}
                      className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  className="text-[#990000] text-sm shadow-md p-2 hover:bg-gray-200 rounded-lg"
                  onClick={() => removeTask(index)}
                >
                  {dictionary.form.tasks.remove}
                </button>
              </div>
            ))}

            {tasks.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                {dictionary.form.tasks.empty}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 gap-4">
            {goal && (
              <button
                type="button"
                onClick={() => handleDeleteGoal(goal.id)}
                className="bg-gray-500 text-white py-2 px-6 rounded-lg hover:bg-gray-600 transition duration-300"
              >
                {dictionary.form.delete}
              </button>
            )}
            <button
              type="submit"
              className="bg-[#990000] text-white py-2 px-6 rounded-lg hover:bg-[#B22222] transition duration-300"
            >
              {goal ? dictionary.submit.update : dictionary.submit.create}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
