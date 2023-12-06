import useSWR from "swr";
import { useSession } from "./AuthProvider";

export function useUser() {
  const { session } = useSession();
  const { data, isLoading, error } = useSWR([
    "session",
    { token: session },
    undefined,
    { method: "POST" },
  ]);

  return { session: data, isLoading, error };
}
