import React from "react";
import { useStorageState } from "./useStorageState";

export const AuthContext = React.createContext<{
  signIn: (token) => void;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
} | null>(null);

// This hook can be used to access the user info.
export function useSession() {
  const value = React.useContext(AuthContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      // throw new Error("useSession must be wrapped in a <SessionProvider />");
    }
  }

  return value;
}

export function SessionProvider(props: React.PropsWithChildren) {
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
          localStorage.clear();
        },
        session,
        isLoading,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}

