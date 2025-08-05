import { CLEAR_APP_CACHE } from "@/components/layout/SWRWrapper";
import { createContext, useContext, type PropsWithChildren } from "react";
import SpotlightSearch from "react-native-spotlight-search";
import { useStorageState } from "./useStorageState";

const AuthContext = createContext<{
  signIn: (t: string) => void;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
}>({
  signIn: () => null,
  signOut: () => null,
  session: null,
  isLoading: false,
});

// This hook can be used to access the user info.
export function useSession() {
  const value = useContext(AuthContext);

  if (process.env.NODE_ENV !== "production") {
    if (!value) {
    }
  }

  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState("session");

  return (
    <AuthContext.Provider
      value={{
        signIn: async (token) => {
          await setSession(token);
        },
        signOut: () => {
          setSession(null);
          (window as any).disableSaveData = true;
          SpotlightSearch.deleteAllSearchItems();
          CLEAR_APP_CACHE();
        },
        session,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

