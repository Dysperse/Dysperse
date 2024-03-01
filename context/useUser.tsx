import useSWR from "swr";
import { useSession } from "./AuthProvider";

export function useUser() {
  const { session } = useSession() || {};
  const { data, isLoading, error, mutate } = useSWR([
    "session",
    { token: session },
    undefined,
  ]);

  return { sessionToken: session, session: data, isLoading, error, mutate };
}
