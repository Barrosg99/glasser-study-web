import { gql } from "@apollo/client";

export const SAVE_CHAT = gql`
  mutation SaveChat($saveChatData: CreateChatDto!, $id: String) {
    saveChat(saveChatData: $saveChatData, id: $id) {
      id
      name
      description
      isModerator
      isInvited
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

export const DELETE_CHAT = gql`
  mutation RemoveChat($id: String!) {
    removeChat(id: $id) {
      id
    }
  }
`;

export const SAVE_MESSAGE = gql`
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

export const MANAGE_INVITATION = gql`
  mutation ManageInvitation($id: String!, $accept: Boolean!) {
    manageInvitation(id: $id, accept: $accept)
  }
`;

export const EXIT_CHAT = gql`
  mutation ExitChat($id: String!) {
    exitChat(id: $id)
  }
`;