"use client";
import {
  Users,
  Plus,
  MoreVertical,
  UserRoundCog,
  MessageCirclePlus,
  TriangleAlert,
} from "lucide-react";
import { getDictionary } from "@/dictionaries";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useRouter } from "next/navigation";
import { useChat } from "../hooks/useChat";
import { Chat, Member } from "../graphql/types";
import ChatModal from "./ChatModal";
import apolloClient from "@/lib/apollo-client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useReportModal } from "@/components/ReportModal";

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
  const { user } = useCurrentUser();
  const [memberList, setMemberList] = useState<Member[]>([]);
  const { open: openReportModal, modal: reportModal } = useReportModal();
  const {
    chats,
    messages,
    loadingChats,
    loadingMessages,
    savingChat,
    handleExitChat,
    handleDeleteChat,
    handleSaveChat,
    handleSaveMessage,
    handleGetMember,
    handleManageInvitation,
  } = useChat({
    selectedChat,
    search,
    conversation,
    dictionary,
  });

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

  useEffect(() => {
    requestAnimationFrame(() => {
      const messagesContainer = document.querySelector(".chat-messages");
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    });
  }, [conversation, messages]);

  const exitChat = async (chatId: string) => {
    await handleExitChat(chatId);
    setShowModal(false);
    resetForm();
  };

  const deleteChat = async (chatId: string) => {
    if (isDeleting) return;

    setIsDeleting(true);
    setTimeout(() => setIsDeleting(false), 2000);
    toast(
      (t) => (
        <span className="flex gap-4">
          <span>{dictionary.toast.deleteConfirm}</span>
          <button
            onClick={() => {
              handleDeleteChat(chatId);
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

    handleSaveChat({
      name,
      description,
      membersIds: memberList.map((member) => member.user.id),
      id: selectedChat?.id,
    });

    setShowModal(false);
    resetForm();
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

    handleSaveMessage(message);

    setNewMessage("");
  };

  const handleAddMember = async () => {
    const { data: memberData } = await handleGetMember(member);

    if (memberData?.user) {
      if (memberData.user.id === user?.id) {
        toast.error("You cannot add yourself to the chat");
        return;
      } else if (memberList.some((m) => m.user.id === memberData.user.id)) {
        toast.error("Member already added");
        return;
      } else {
        setMemberList([
          ...memberList,
          {
            user: memberData.user,
            isInvited: true,
            isModerator: false,
          },
        ]);
        setMember("");
      }
    }
  };

  const handleRemoveMember = (id: string) => {
    setMemberList(memberList.filter((m) => m.user.id !== id));
  };

  const handleChatInvite = async (id: string, accept: boolean) => {
    await handleManageInvitation(id, accept);
    if (accept) {
      toast.success("Convite aceito com sucesso!");
    } else {
      toast.success("Convite recusado com sucesso!");
    }
    setShowModal(false);
    resetForm();
  };

  return (
    <div className="flex h-screen bg-gray-100 pt-[74px]">
      <ChatModal
        showModal={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        selectedChat={selectedChat}
        name={name}
        description={description}
        member={member}
        memberList={memberList}
        savingChat={savingChat}
        onNameChange={setName}
        onDescriptionChange={setDescription}
        onMemberChange={setMember}
        onAddMember={handleAddMember}
        onRemoveMember={handleRemoveMember}
        onDeleteChat={deleteChat}
        onChatInvite={handleChatInvite}
        onExitChat={exitChat}
        onSubmit={handleSubmit}
        dictionary={dictionary}
      />
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
          ) : chats.length === 0 && search ? (
            <li className="flex items-center justify-center p-4 text-gray-500">
              {dictionary.list.emptySearch}
            </li>
          ) : chats.length === 0 ? (
            <li className="flex items-center justify-center p-4 text-gray-500">
              {dictionary.list.empty}
            </li>
          ) : (
            chats.map((chat) => {
              if (chat.isInvited) {
                return (
                  <li
                    key={chat.id}
                    className="flex items-start gap-3 bg-red-200 border border-gray-200 p-2 hover:bg-green-200 transition-colors duration-200 cursor-pointer"
                    onClick={() => handleOpenModal(chat)}
                  >
                    <UserRoundCog size={32} className="text-gray-500 mt-1" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-400">
                        {chat.name}
                      </div>
                      <div className="text-sm text-gray-700">
                        Aguardando aprovação
                      </div>
                    </div>
                  </li>
                );
              } else {
                return (
                  <li
                    key={chat.id}
                    className="flex items-start gap-3 bg-white border border-gray-200 p-2 hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
                    onClick={() => {
                      // update the member has read to true on the apollo cache
                      apolloClient.cache.modify({
                        id: apolloClient.cache.identify({
                          __typename: "Chat",
                          id: chat.id,
                        }),
                        fields: { hasRead: () => true },
                      });
                      setConversation(chat);
                    }}
                  >
                    <Users size={32} className="text-gray-500 mt-1" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-400">
                        {chat.name}
                      </div>
                      <div className="text-sm text-gray-700">
                        {chat.description}
                      </div>
                    </div>
                    {!chat.hasRead && (
                      <div className="text-sm text-gray-700">
                        <MessageCirclePlus size={30} className="text-red-500" />
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(chat);
                      }}
                      className="p-1 hover:bg-gray-300 rounded-full transition-colors"
                    >
                      <MoreVertical size={20} className="text-gray-500" />
                    </button>
                  </li>
                );
              }
            })
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
                messages.map((message) => {
                  const { isCurrentUser } = message;

                  return (
                    <div
                      key={message.id}
                      className={`group flex flex-col space-y-1 max-w-[50%] ${
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
                        {!isCurrentUser && (
                          <button
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-opacity duration-200"
                            onClick={() => {
                              openReportModal();
                            }}
                          >
                            <TriangleAlert size={20} />
                          </button>
                        )}
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
      {reportModal}
    </div>
  );
}
