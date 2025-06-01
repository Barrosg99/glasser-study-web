"use client";
import { Users, Plus, X, MoreVertical } from "lucide-react";
import { getDictionary } from "@/dictionaries";
import { useEffect, useState } from "react";
import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { toast } from "react-hot-toast";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface Group {
  id: string;
  name: string;
  description: string;
  members: {
    id: string;
    name: string;
    email: string;
  }[];
  isModerator: boolean;
}

interface Message {
  id: string;
  content: string;
  isCurrentUser: boolean;
  sender: {
    id: string;
    name: string;
    email: string;
  };
  group: {
    id: string;
    name: string;
  };
  createdAt: Date;
}

const GET_GROUPS = gql`
  query GetGroups {
    myGroups {
      id
      name
      description
      members {
        id
        name
        email
      }
      isModerator
    }
  }
`;

const SAVE_GROUP_MUTATION = gql`
  mutation SaveGroup($saveGroupData: CreateGroupDto!, $id: String) {
    saveGroup(saveGroupData: $saveGroupData, id: $id) {
      id
    }
  }
`;

const DELETE_GROUP_MUTATION = gql`
  mutation RemoveGroup($id: String!) {
    removeGroup(id: $id) {
      id
    }
  }
`;

const GET_MESSAGES = gql`
  query GetMessages($groupId: ID!) {
    groupMessages(groupId: $groupId) {
      id
      content
      isCurrentUser
      sender {
        id
        name
        email
      }
      createdAt
    }
  }
`;

const SAVE_MESSAGE_MUTATION = gql`
  mutation SaveMessage($saveMessageInput: SaveMessageDto!) {
    saveMessage(saveMessageInput: $saveMessageInput) {
      id
      content
      isCurrentUser
      sender {
        id
        name
        email
      }
      createdAt
    }
  }
`;

export default function GroupsPage({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["groups"];
}) {
  const [showModal, setShowModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [members, setMembers] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [token] = useLocalStorage<string>("token");
  const [newMessage, setNewMessage] = useState("");
  const [conversation, setConversation] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setConversation(null);
      }
    };

    window.addEventListener("keydown", handleEscapeKey);
    return () => window.removeEventListener("keydown", handleEscapeKey);
  }, []);

  const { data: groupsData, loading: loadingGroups } = useQuery<{
    myGroups: Group[];
  }>(GET_GROUPS, {
    context: {
      headers: {
        Authorization: token,
      },
    },
  });

  const [
    getMessages,
    {
      data: { groupMessages = [] } = { groupMessages: [] },
      loading: loadingMessages,
    },
  ] = useLazyQuery<{
    groupMessages: Message[];
  }>(GET_MESSAGES, {
    pollInterval: 1000,
    context: {
      headers: {
        Authorization: token,
      },
    },
  });

  useEffect(() => {
    if (conversation) {
      getMessages({
        variables: {
          groupId: conversation.id,
        },
      });
    }
  }, [conversation, getMessages]);

  useEffect(() => {
    requestAnimationFrame(() => {
      const messagesContainer = document.querySelector(".chat-messages");
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    });
  }, [groupMessages]);

  const [saveGroup, { loading }] = useMutation(SAVE_GROUP_MUTATION, {
    context: {
      headers: {
        Authorization: token,
      },
    },
    onCompleted: () => {
      toast.success(
        selectedGroup
          ? dictionary.toast.updateSuccess
          : dictionary.toast.createSuccess
      );
      setShowModal(false);
      resetForm();
    },
    onError: () => {
      toast.error(
        selectedGroup
          ? dictionary.toast.updateError
          : dictionary.toast.createError
      );
    },
    refetchQueries: [
      {
        query: GET_GROUPS,
        context: {
          headers: {
            Authorization: token,
          },
        },
      },
    ],
  });

  const [saveMessage] = useMutation(SAVE_MESSAGE_MUTATION, {
    context: {
      headers: {
        Authorization: token,
      },
    },
    update: (cache, { data: mutationData }) => {
      if (!conversation) return;

      const existingData = cache.readQuery<{
        groupMessages: Message[];
      }>({
        query: GET_MESSAGES,
        variables: {
          groupId: conversation.id,
        },
      });

      if (existingData) {
        cache.writeQuery({
          query: GET_MESSAGES,
          variables: {
            groupId: conversation.id,
          },
          data: {
            groupMessages: [
              ...existingData.groupMessages,
              mutationData.saveMessage,
            ],
          },
        });
      }
    },
  });

  const [deleteGroup] = useMutation(DELETE_GROUP_MUTATION, {
    context: {
      headers: {
        Authorization: token,
      },
    },
    onCompleted: () => {
      toast.success(dictionary.toast.deleteSuccess);
      setShowModal(false);
    },
    onError: () => {
      toast.error(dictionary.toast.deleteError);
    },
    refetchQueries: [
      {
        query: GET_GROUPS,
        context: {
          headers: {
            Authorization: token,
          },
        },
      },
    ],
  });

  const handleDeleteGroup = async (groupId: string) => {
    if (isDeleting) return;

    setIsDeleting(true);
    setTimeout(() => setIsDeleting(false), 2000);
    toast(
      (t) => (
        <span className="flex gap-4">
          <span>{dictionary.toast.deleteConfirm}</span>
          <button
            onClick={() => {
              deleteGroup({
                variables: {
                  id: groupId,
                },
              });
              toast.dismiss(t.id);
              setShowModal(false);
            }}
            className="text-blue-500 hover:text-blue-700"
          >
            {dictionary.toast.deleteConfirmYes}
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-red-500 hover:text-red-700"
          >
            {dictionary.toast.deleteConfirmNo}
          </button>
        </span>
      ),
      {
        position: "bottom-center",
        duration: 2000,
      }
    );
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setMembers("");
    setSelectedGroup(null);
    setNewMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    saveGroup({
      variables: {
        saveGroupData: {
          name,
          description,
          memberEmails: members
            .split(",")
            .map((email) => email.trim())
            .filter(Boolean),
        },
        id: selectedGroup?.id,
      },
    });
  };

  const handleOpenModal = (group?: Group) => {
    if (group) {
      setSelectedGroup(group);
      setName(group.name);
      setDescription(group.description);
      setMembers(group.members.map((member) => member.email).join(","));
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversation) return;

    const message = {
      content: newMessage,
      groupId: conversation.id,
    };

    saveMessage({
      variables: {
        saveMessageInput: message,
      },
    });

    setNewMessage("");
  };

  return (
    <div className="flex h-screen bg-gray-100 pt-[74px]">
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => {
            setShowModal(false);
            resetForm();
          }}
        >
          <div
            className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              aria-label="Fechar"
            >
              <X size={24} />
            </button>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  {dictionary.create.name.label}
                  <span className="text-red-600"> *</span>
                </label>
                <input
                  type="text"
                  className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder={dictionary.create.name.placeholder}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={selectedGroup?.isModerator === false}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  {dictionary.create.description.label}
                  <span className="text-red-600"> *</span>
                </label>
                <input
                  type="text"
                  className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder={dictionary.create.description.placeholder}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  disabled={selectedGroup?.isModerator === false}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  {dictionary.create.members.label}
                </label>
                <input
                  type="text"
                  className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder={dictionary.create.members.placeholder}
                  value={members}
                  onChange={(e) => setMembers(e.target.value)}
                  disabled={selectedGroup?.isModerator === false}
                />
              </div>
              <div className="flex justify-end gap-4">
                {selectedGroup?.isModerator && (
                  <button
                    type="button"
                    onClick={() => handleDeleteGroup(selectedGroup.id)}
                    className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition"
                  >
                    {dictionary.create.delete}
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading || selectedGroup?.isModerator === false}
                  className="bg-[#990000] text-white px-6 py-2 rounded hover:bg-[#B22222] transition disabled:bg-gray-400"
                >
                  {loading
                    ? selectedGroup
                      ? dictionary.create.submit.updating
                      : dictionary.create.submit.creating
                    : selectedGroup
                    ? dictionary.create.submit.update
                    : dictionary.create.submit.create}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <aside className="w-80 border-r">
        <div className="mb-4 flex items-center gap-2 px-4 pt-4">
          <input
            type="text"
            placeholder={dictionary.search.placeholder}
            className="w-full bg-white px-4 py-2 rounded-full border border-gray-100 text-black focus:outline-none placeholder:text-gray-400"
          />
          <button
            className="bg-[#990000] text-white px-4 py-2 rounded-full hover:bg-[#B22222] transition"
            type="button"
            onClick={() => handleOpenModal()}
          >
            <Plus size={20} />
          </button>
        </div>
        <ul className="">
          {loadingGroups ? (
            <li className="flex items-center justify-center p-4 text-gray-500">
              {dictionary.list.loading}
            </li>
          ) : groupsData?.myGroups?.length === 0 ? (
            <li className="flex items-center justify-center p-4 text-gray-500">
              {dictionary.list.empty}
            </li>
          ) : (
            groupsData?.myGroups?.map((group) => (
              <li
                key={group.id}
                className="flex items-start gap-3 bg-white border border-gray-200 p-2 hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
                onClick={() => {
                  setConversation({ id: group.id, name: group.name });
                }}
              >
                <Users size={32} className="text-gray-500 mt-1" />
                <div className="flex-1">
                  <div className="font-medium text-gray-400">{group.name}</div>
                  <div className="text-sm text-gray-700">
                    {group.description}
                  </div>
                </div>
                <button
                  onClick={() => handleOpenModal(group)}
                  className="p-1 hover:bg-gray-300 rounded-full transition-colors"
                >
                  <MoreVertical size={20} className="text-gray-500" />
                </button>
              </li>
            ))
          )}
        </ul>
      </aside>
      <main className="flex-1 bg-white m-4 rounded-lg shadow-lg flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {conversation ? conversation.name : dictionary.messages.selectGroup}
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 chat-messages">
          {!conversation ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-gray-500 text-center">
                {dictionary.messages.selectGroupToView}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {loadingMessages ? (
                <div className="flex items-center justify-center p-4 text-gray-500">
                  {dictionary.list.loading}
                </div>
              ) : (
                groupMessages.map((message) => {
                  const { isCurrentUser } = message;

                  return (
                    <div
                      key={message.id}
                      className={`flex flex-col space-y-1 max-w-[50%] ${
                        isCurrentUser ? "ml-auto" : "mr-auto"
                      }`}
                    >
                      <div
                        className={`flex items-center space-x-2 ${
                          isCurrentUser ? "justify-end" : ""
                        }`}
                      >
                        <span className="font-medium text-gray-900">
                          {message.sender.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <div
                        className={`rounded-lg p-3 ${
                          isCurrentUser
                            ? "bg-[#990000] text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
        {conversation && (
          <div className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={dictionary.messages.typeMessage}
                className="flex-1 bg-gray-50 border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-[#990000] text-white px-6 py-2 rounded hover:bg-[#B22222] transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {dictionary.messages.send}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
