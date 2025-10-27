import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { toast } from "react-hot-toast";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { GET_CHATS, GET_MESSAGES, GET_MEMBER } from "../graphql/queries";
import {
  SAVE_CHAT,
  DELETE_CHAT,
  SAVE_MESSAGE,
  MANAGE_INVITATION,
  EXIT_CHAT,
} from "../graphql/mutation";
import { getDictionary } from "@/dictionaries";
import { useEffect, useRef } from "react";
import { Chat, Member, Message } from "../graphql/types";

export function useChat({
  selectedChat,
  search,
  conversation,
  dictionary,
}: {
  selectedChat: Chat | null;
  conversation: Chat | null;
  search: string;
  dictionary: Awaited<ReturnType<typeof getDictionary>>["chat"];
}) {
  const [token] = useLocalStorage<string>("token");

  const {
    data: chatsData,
    loading: loadingChats,
    refetch: refetchChats,
  } = useQuery<{
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
    fetchPolicy: "network-only",
  });

  // Lazy query para buscar mensagens
  const [
    getMessages,
    {
      data: { chatMessages = [] } = { chatMessages: [] },
      loading: loadingMessages,
      stopPolling: stopPollingMessages,
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

  // Lazy query para buscar membros
  const [getMember] = useLazyQuery<{
    user: Member["user"];
  }>(GET_MEMBER, {
    context: {
      headers: {
        Authorization: token,
      },
    },
    onError: () => {
      toast.error(dictionary.toast.memberNotFound);
    },
  });

  // Mutation para salvar chat
  const [saveChat, { loading: savingChat }] = useMutation(SAVE_CHAT, {
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

  // Mutation para salvar mensagem
  const [saveMessage] = useMutation(SAVE_MESSAGE, {
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

  // Mutation para deletar chat
  const [deleteChat] = useMutation(DELETE_CHAT, {
    context: {
      headers: {
        Authorization: token,
      },
    },
    onCompleted: () => {
      toast.success(dictionary.toast.deleteSuccess);
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

  // Mutation para gerenciar convites
  const [manageInvitation] = useMutation(MANAGE_INVITATION, {
    context: {
      headers: {
        Authorization: token,
      },
    },
    onCompleted: () => {
      refetchChats();
    },
    onError: () => {
      toast.error(dictionary.toast.manageInvitationError);
    },
  });

  // Mutation para sair do chat
  const [exitChat] = useMutation(EXIT_CHAT, {
    context: {
      headers: {
        Authorization: token,
      },
    },
    onCompleted: () => {
      toast.success(dictionary.toast.exitChatSuccess);
      refetchChats();
    },
    onError: () => {
      toast.error(dictionary.toast.exitChatError);
    },
  });

  // Funções auxiliares
  const handleSaveChat = async (chatData: {
    name: string;
    description: string;
    membersIds: string[];
    id?: string;
  }) => {
    return saveChat({
      variables: {
        saveChatData: {
          name: chatData.name,
          description: chatData.description,
          membersIds: chatData.membersIds,
        },
        id: chatData.id,
      },
    });
  };

  const handleDeleteChat = async (chatId: string) => {
    return deleteChat({
      variables: {
        id: chatId,
      },
    });
  };

  const handleSaveMessage = async (messageData: {
    content: string;
    chatId: string;
  }) => {
    return saveMessage({
      variables: {
        saveMessageInput: messageData,
      },
    });
  };

  const handleManageInvitation = async (id: string, accept: boolean) => {
    return manageInvitation({
      variables: {
        id,
        accept,
      },
    });
  };

  const handleExitChat = async (chatId: string) => {
    return exitChat({
      variables: {
        id: chatId,
      },
    });
  };

  const handleGetMember = async (email: string) => {
    return getMember({
      variables: {
        email,
      },
    });
  };

  const prevConversationRef = useRef<Chat | null>(null);

  useEffect(() => {
    if (conversation) {
      getMessages({
        variables: {
          chatId: conversation.id,
        },
      });
    } else if (prevConversationRef.current) {
      stopPollingMessages();
    }
    prevConversationRef.current = conversation;
  }, [conversation, getMessages, stopPollingMessages]);

  return {
    // Dados
    chats: chatsData?.myChats || [],
    messages: chatMessages,

    // Estados de loading
    loadingChats,
    loadingMessages,
    savingChat,

    // Funções
    handleSaveChat,
    handleDeleteChat,
    handleSaveMessage,
    handleManageInvitation,
    handleExitChat,
    handleGetMember,
  };
}
