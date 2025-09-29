"use client";

import { useEffect, useState } from "react";
import { ChevronDown, MoreVertical, Check, ExternalLink } from "lucide-react";
import { getDictionary } from "@/dictionaries";
import GoalModal from "./GoalModal";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useRouter } from "next/navigation";
import { GET_MY_GOALS } from "../graphql/queries";
import { useMutation, useQuery } from "@apollo/client";
import { Loading } from "@/components/Loading";
import {
  TOGGLE_TASK_MUTATION,
} from "../graphql/mutations";

export interface Task {
  name: string;
  link?: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  name: string;
  description?: string;
  tasks: Task[];
}

export default function GoalsPage({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["goals"];
}) {
  const router = useRouter();

  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const [token] = useLocalStorage<string>("token");

  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  });

  const { data, loading } = useQuery<{ myGoals: Goal[] }>(GET_MY_GOALS, {
    context: {
      headers: {
        Authorization: token,
      },
    },
  });

  const toggleGoalExpansion = (goalId: string) => {
    const newExpanded = new Set(expandedGoals);
    if (newExpanded.has(goalId)) {
      newExpanded.delete(goalId);
    } else {
      newExpanded.add(goalId);
    }
    setExpandedGoals(newExpanded);
  };

  const calculateProgress = (tasks: Task[]) => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter((task) => task.completed).length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  const [toggleTask] = useMutation(TOGGLE_TASK_MUTATION, {
    context: {
      headers: {
        Authorization: token,
      },
    },
    update: (cache, { data: mutationData }) => {
      const existingData = cache.readQuery<{
        myGoals: Goal[];
      }>({
        query: GET_MY_GOALS,
      });

      if (existingData) {
        const { goalId, taskId, completed } = mutationData.toggleTask;
        const filteredGoals = existingData.myGoals.map((goal) =>
          goal.id === goalId
            ? {
                ...goal,
                tasks: goal.tasks.map((task, index) =>
                  index === taskId ? { ...task, completed: completed } : task
                ),
              }
            : goal
        );
        cache.writeQuery({
          query: GET_MY_GOALS,
          data: { myGoals: filteredGoals },
        });
      }
    },
  });

  const toggleTaskCompletion = async (goalId: string, taskId: number) => {
    await toggleTask({
      variables: {
        goalId,
        taskId,
      },
    });
  };

  const handleOpenModal = (goal: Goal | null) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGoal(null);
  };

  return (
    <main className="min-h-screen bg-gray-50 pt-20 text-black pt-[74px]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-black text-2xl font-bold">{dictionary.title}</h1>
          <button
            onClick={() => handleOpenModal(null)}
            className="bg-[#990000] text-white px-4 py-2 rounded-md hover:bg-[#B22222] transition duration-300"
          >
            {dictionary.newGoal}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            <Loading>{dictionary.loading}</Loading>
          ) : data?.myGoals.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">
              {dictionary.noGoals}
            </div>
          ) : (
            data?.myGoals.map((goal) => (
              <div
                key={goal.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      {goal.name}
                    </h2>
                    <p className="text-gray-600 mb-4">{goal.description}</p>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-sm font-medium text-gray-700">
                        {calculateProgress(goal.tasks)}%
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#990000] h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${calculateProgress(goal.tasks)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenModal(goal)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <MoreVertical size={20} />
                  </button>
                </div>

                <div className="border-t pt-4">
                  <button
                    onClick={() => toggleGoalExpansion(goal.id)}
                    className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors duration-200 mb-3"
                  >
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${
                        expandedGoals.has(goal.id) ? "rotate-180" : ""
                      }`}
                    />
                    <span className="font-medium">{dictionary.tasks}</span>
                  </button>

                  {!expandedGoals.has(goal.id) && (
                    <div className="space-y-3">
                      {goal.tasks.map((task, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors duration-200"
                        >
                          <button
                            onClick={() => toggleTaskCompletion(goal.id, index)}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                              task.completed
                                ? "bg-gray-800 border-gray-800 text-white"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                          >
                            {task.completed && <Check size={12} />}
                          </button>
                          <div className="flex-1">
                            <p
                              className={`text-sm ${
                                task.completed
                                  ? "text-gray-500 line-through"
                                  : "text-gray-700"
                              }`}
                            >
                              {task.name}
                            </p>
                            {task.link && (
                              <a
                                href={task.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`text-xs flex items-center gap-1 mt-1 hover:underline ${
                                  task.completed
                                    ? "text-gray-400"
                                    : "text-blue-600 hover:text-blue-800"
                                }`}
                              >
                                {task.link}
                                <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <GoalModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        goal={editingGoal}
        token={token || ""}
        dictionary={dictionary.modal}
      />
    </main>
  );
}
