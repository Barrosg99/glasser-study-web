import { gql, useQuery } from "@apollo/client";
import { useLocalStorage } from "./useLocalStorage";

const GET_USER = gql`
  query Me {
    me {
      id
      name
      email
      goal
    }
  }
`;

export function useCurrentUser() {
  const [token] = useLocalStorage<string>("token");

  const { data, loading, error } = useQuery(GET_USER, {
    skip: !token,
  context: {
      headers: {
        Authorization: token,
      },
    },
  });

  return {
    user: data?.me ?? null,
    loading,
    error,
  };
}
