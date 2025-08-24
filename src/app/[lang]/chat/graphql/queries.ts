import { gql } from "@apollo/client";

export const GET_CHATS = gql`
  query GetChats($search: String) {
    myChats(search: $search) {
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

export const GET_MEMBER = gql`
  query GetMember($email: String!) {
    user(email: $email) {
      id
      name
      email
    }
  }
`;

export const GET_MESSAGES = gql`
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