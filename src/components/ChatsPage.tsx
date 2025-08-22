"use client";
import { Users, Plus, X, MoreVertical } from "lucide-react";
import { getDictionary } from "@/dictionaries";
import { useEffect, useState } from "react";
import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { toast } from "react-hot-toast";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useRouter } from "next/navigation";
// import { useCurrentUser } from "@/hooks/useCurrentUser";

interface Chat {
  id: string;
  name: string;
  description: string;
  members: Member[];
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
  chat: {
    id: string;
    name: string;
  };
  createdAt: Date;
}

interface Member {
  user: {
    id: string;
    name: string;
    email: string;
  };
  isInvited: boolean;
  isModerator: boolean;
}

const GET_CHATS = gql`
  query GetChats($search: String) {
    myChats(search: $search) {
      id
      name
      description
      isModerator
      members {
        user {
          id
          name
          email
        }
        isInvited
        isModerator
      }
    }
  }
`;

const SAVE_CHAT_MUTATION = gql`
  mutation SaveChat($saveChatData: CreateChatDto!, $id: String) {
    saveChat(saveChatData: $saveChatData, id: $id) {
      id
      name
      description
      isModerator
      members {
        user {
          id
          name
          email
        }
        isInvited
        isModerator
      }
    }
  }
`;

const DELETE_CHAT_MUTATION = gql`
  mutation RemoveChat($id: String!) {
    removeChat(id: $id) {
      id
    }
  }
`;

const GET_MESSAGES = gql`
  query GetMessages($chatId: ID!) {
    chatMessages(chatId: $chatId) {
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

const GET_MEMBER = gql`
  query GetMember($email: String!) {
    user(email: $email) {
      id
      name
      email
    }
  }
`;

export default function ChatsPage({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["chat"];
}) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [member, setMember] = useState("");
  const [search, setSearch] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [token] = useLocalStorage<string>("token");
  const [newMessage, setNewMessage] = useState("");
  const [conversation, setConversation] = useState<Chat | null>(null);

  const [memberList, setMemberList] = useState<Member[]>([]);
  // const { user } = useCurrentUser();

  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  });

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setConversation(null);
      }
    };

    window.addEventListener("keydown", handleEscapeKey);
    return () => window.removeEventListener("keydown", handleEscapeKey);
  }, []);

  const { data: chatsData, loading: loadingChats } = useQuery<{
    myChats: Chat[];
  }>(GET_CHATS, {
    context: {
      headers: {
        Authorization: token,
      },
    },
    variables: {
      search,
    },
  });

  const [
    getMessages,
    {
      data: { chatMessages = [] } = { chatMessages: [] },
      loading: loadingMessages,
    },
  ] = useLazyQuery<{
    chatMessages: Message[];
  }>(GET_MESSAGES, {
    pollInterval: 1000,
    context: {
      headers: {
        Authorization: token,
      },
    },
  });

  const [getMember] = useLazyQuery<{
    user: Member["user"];
  }>(GET_MEMBER, {
    variables: { email: member },
    context: {
      headers: {
        Authorization: token,
      },
    },
    onError: () => {
      toast.error("Member not found");
    },
  });

  useEffect(() => {
    if (conversation) {
      getMessages({
        variables: {
          chatId: conversation.id,
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
  }, [conversation, chatMessages]);

  const [saveChat, { loading }] = useMutation(SAVE_CHAT_MUTATION, {
    context: {
      headers: {
        Authorization: token,
      },
    },
    onCompleted: () => {
      toast.success(
        selectedChat
          ? dictionary.toast.updateSuccess
          : dictionary.toast.createSuccess
      );
      setShowModal(false);
      resetForm();
    },
    onError: () => {
      toast.error(
        selectedChat
          ? dictionary.toast.updateError
          : dictionary.toast.createError
      );
    },
    update: (cache, { data: mutationData }) => {
      const existingData = cache.readQuery<{
        myChats: Chat[];
      }>({
        query: GET_CHATS,
        variables: { search },
      });

      if (existingData) {
        const filteredChats = [
          ...existingData.myChats.filter(
            (chat) => chat.id !== mutationData.saveChat.id
          ),
          mutationData.saveChat,
        ];

        cache.writeQuery({
          query: GET_CHATS,
          variables: { search },
          data: {
            myChats: filteredChats,
          },
        });
      }
    },
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
        chatMessages: Message[];
      }>({
        query: GET_MESSAGES,
        variables: {
          chatId: conversation.id,
        },
      });

      if (existingData) {
        cache.writeQuery({
          query: GET_MESSAGES,
          variables: {
            chatId: conversation.id,
          },
          data: {
            chatMessages: [
              ...existingData.chatMessages,
              mutationData.saveMessage,
            ],
          },
        });
      }
    },
  });

  const [deleteChat] = useMutation(DELETE_CHAT_MUTATION, {
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
    update: (cache, { data: mutationData }) => {
      cache.evict({
        id: cache.identify({
          __typename: "Chat",
          id: mutationData.removeChat.id,
        }),
      });
    },
  });

  const handleDeleteChat = async (chatId: string) => {
    if (isDeleting) return;

    setIsDeleting(true);
    setTimeout(() => setIsDeleting(false), 2000);
    toast(
      (t) => (
        <span className="flex gap-4">
          <span>{dictionary.toast.deleteConfirm}</span>
          <button
            onClick={() => {
              deleteChat({
                variables: {
                  id: chatId,
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
    setMember("");
    setSelectedChat(null);
    setNewMessage("");
    setMemberList([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    saveChat({
      variables: {
        saveChatData: {
          name,
          description,
          membersIds: memberList.map((member) => member.user.id),
        },
        id: selectedChat?.id,
      },
    });
  };

  const handleOpenModal = (chat?: Chat) => {
    if (chat) {
      setSelectedChat(chat);
      setName(chat.name);
      setDescription(chat.description);
      setMemberList(chat.members);
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
      chatId: conversation.id,
    };

    saveMessage({
      variables: {
        saveMessageInput: message,
      },
    });

    setNewMessage("");
  };

  const handleAddMember = async () => {
    const { data: memberData } = await getMember({
      variables: {
        email: member,
      },
    });

    if (memberData?.user) {
      if (memberList.some((m) => m.user.id === memberData.user.id)) {
        toast.error("Member already added");
        return;
      } else {
        setMemberList([...memberList, {
          user: memberData.user,
          isInvited: true,
          isModerator: false,
        }]);
        setMember("");
      }
    }
  };

  const handleRemoveMember = (id: string) => {
    setMemberList(memberList.filter((m) => m.user.id !== id));
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
                  disabled={selectedChat?.isModerator === false}
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
                  disabled={selectedChat?.isModerator === false}
                />
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-black mb-1">
                    {dictionary.create.members.label}
                  </label>
                  <input
                    type="text"
                    className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder={dictionary.create.members.placeholder}
                    value={member}
                    onChange={(e) => setMember(e.target.value)}
                    disabled={selectedChat?.isModerator === false}
                  />
                </div>
                <button
                  type="button"
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
                  onClick={handleAddMember}
                >
                  Add
                </button>
              </div>
              {/* <div
                key={user?.id}
                className="text-black bg-gray-200 p-2 rounded-lg"
              >
                {user?.name} - {user?.email} - Moderator
              </div> */}
              {memberList
                // .filter((member) => member.user.id !== user?.id)
                .map((member) => (
                  <div
                    key={member.user.id}
                    className="text-black bg-gray-200 p-2 rounded-lg flex justify-between"
                  >
                    {member.user.name} - {member.user.email} - {member.isModerator ? "Moderator" : member.isInvited ? "Invited" : "Member"}
                    <span
                      className="text-red-500 cursor-pointer"
                      onClick={() => handleRemoveMember(member.user.id)}
                    >
                      <X size={20} />
                    </span>
                  </div>
                ))}
              <div className="flex justify-end gap-4">
                {selectedChat?.isModerator && (
                  <button
                    type="button"
                    onClick={() => handleDeleteChat(selectedChat.id)}
                    className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition"
                  >
                    {dictionary.create.delete}
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading || selectedChat?.isModerator === false}
                  className="bg-[#990000] text-white px-6 py-2 rounded hover:bg-[#B22222] transition disabled:bg-gray-400"
                >
                  {loading
                    ? selectedChat
                      ? dictionary.create.submit.updating
                      : dictionary.create.submit.creating
                    : selectedChat
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
            onChange={(e) => setSearch(e.target.value)}
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
          {loadingChats ? (
            <li className="flex items-center justify-center p-4 text-gray-500">
              {dictionary.list.loading}
            </li>
          ) : chatsData?.myChats?.length === 0 && search ? (
            <li className="flex items-center justify-center p-4 text-gray-500">
              {dictionary.list.emptySearch}
            </li>
          ) : chatsData?.myChats?.length === 0 ? (
            <li className="flex items-center justify-center p-4 text-gray-500">
              {dictionary.list.empty}
            </li>
          ) : (
            chatsData?.myChats?.map((chat) => (
              // criar logica de aceitar/recusar invite
              <li
                key={chat.id}
                className="flex items-start gap-3 bg-white border border-gray-200 p-2 hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
                onClick={() => {
                  setConversation(chat);
                }}
              >
                <Users size={32} className="text-gray-500 mt-1" />
                <div className="flex-1">
                  <div className="font-medium text-gray-400">{chat.name}</div>
                  <div className="text-sm text-gray-700">
                    {chat.description}
                  </div>
                </div>
                <button
                  onClick={() => handleOpenModal(chat)}
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
            {conversation ? conversation.name : dictionary.messages.selectChat}
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 chat-messages">
          {!conversation ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-gray-500 text-center">
                {dictionary.messages.selectChatToView}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {loadingMessages ? (
                <div className="flex items-center justify-center p-4 text-gray-500">
                  {dictionary.list.loading}
                </div>
              ) : (
                chatMessages.map((message) => {
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
