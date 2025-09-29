"use client";
import { X } from "lucide-react";
import { Chat, Member } from "../graphql/types";
import { getDictionary } from "@/dictionaries";

interface ChatModalProps {
  showModal: boolean;
  onClose: () => void;
  selectedChat: Chat | null;
  name: string;
  description: string;
  member: string;
  memberList: Member[];
  savingChat: boolean;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  onMemberChange: (member: string) => void;
  onAddMember: () => void;
  onRemoveMember: (id: string) => void;
  onDeleteChat: (chatId: string) => void;
  onChatInvite: (id: string, accept: boolean) => void;
  onExitChat: (chatId: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  dictionary: Awaited<ReturnType<typeof getDictionary>>["chat"];
}

export default function ChatModal({
  showModal,
  onClose,
  selectedChat,
  name,
  description,
  member,
  memberList,
  savingChat,
  onNameChange,
  onDescriptionChange,
  onMemberChange,
  onAddMember,
  onRemoveMember,
  onDeleteChat,
  onChatInvite,
  onExitChat,
  onSubmit,
  dictionary,
}: ChatModalProps) {
  if (!showModal) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
          aria-label="Fechar"
        >
          <X size={24} />
        </button>
        <form className="space-y-6" onSubmit={onSubmit}>
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
              onChange={(e) => onNameChange(e.target.value)}
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
              onChange={(e) => onDescriptionChange(e.target.value)}
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
                onChange={(e) => onMemberChange(e.target.value)}
                disabled={selectedChat?.isModerator === false}
              />
            </div>
            <button
              type="button"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
              onClick={onAddMember}
            >
              Add
            </button>
          </div>
          {memberList.map((member) => (
            <div
              key={member.user.id}
              className="text-black bg-gray-200 p-2 rounded-lg flex justify-between"
            >
              {member.user.name} - {member.user.email} -{" "}
              {member.isModerator
                ? "Moderator"
                : member.isInvited
                ? "Invited"
                : "Member"}
              <span
                className="text-red-500 cursor-pointer"
                onClick={() => onRemoveMember(member.user.id)}
              >
                <X size={20} />
              </span>
            </div>
          ))}
          <div className="flex justify-end gap-4">
            {(!selectedChat || selectedChat.isModerator) && (
              <button
                type="submit"
                disabled={savingChat}
                className="bg-[#990000] text-white px-6 py-2 rounded hover:bg-[#B22222] transition disabled:bg-gray-400"
              >
                {savingChat
                  ? selectedChat
                    ? dictionary.create.submit.updating
                    : dictionary.create.submit.creating
                  : selectedChat
                  ? dictionary.create.submit.update
                  : dictionary.create.submit.create}
              </button>
            )}
            {selectedChat?.isModerator && (
              <>
                <button
                  type="button"
                  onClick={() => onDeleteChat(selectedChat.id)}
                  className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition"
                >
                  {dictionary.create.delete}
                </button>
              </>
            )}
            {selectedChat?.isInvited && (
              <>
                <button
                  type="button"
                  onClick={() => onChatInvite(selectedChat.id, true)}
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
                >
                  Aceitar
                </button>
                <button
                  type="button"
                  onClick={() => onChatInvite(selectedChat.id, false)}
                  className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition mr-2"
                >
                  Recusar
                </button>
              </>
            )}
            {selectedChat &&
              !selectedChat.isModerator &&
              !selectedChat.isInvited && (
                <button
                  type="button"
                  onClick={() => onExitChat(selectedChat.id)}
                  className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition"
                >
                  Sair do chat
                </button>
              )}
          </div>
        </form>
      </div>
    </div>
  );
}
