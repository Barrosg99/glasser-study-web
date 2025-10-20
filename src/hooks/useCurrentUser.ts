import { gql, useQuery } from "@apollo/client";
import { useLocalStorage } from "./useLocalStorage";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

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
  const [token, setToken] = useLocalStorage<string>("token");
  const router = useRouter();

  const { data, loading, error } = useQuery(GET_USER, {
    skip: !token,
    context: {
      headers: {
        Authorization: token,
      },
    },
  });

  if (error?.message === "User is blocked.") {
    setToken(undefined);
    router.push("/login");
    toast.error("User is blocked.");
  }

  return {
    user: data?.me ?? null,
    loading,
    error,
  };
}
