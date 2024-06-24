import useSWR from "swr";
import { useSession } from "./AuthProvider";

export function useUser() {
  const { session } = useSession() || {};
  const { data, isLoading, error, mutate, isValidating } = useSWR(
    session ? ["session", { token: session }, undefined] : null
  );

  return {
    sessionToken: session,
    session: data,
    isLoading,
    error,
    mutate,
    isValidating,
  };
}
