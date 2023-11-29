import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSegments, useRouter } from "expo-router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { sendApiRequest } from "../helpers/api";
import { Spinner } from "tamagui";
import { View } from "tamagui";

type User = {
  name: string;
};

type AuthType = {
  user: User | null;
  setUser: (user: User | null) => void;
};

const AuthContext = createContext<AuthType>({
  user: null,
  setUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({
  children,
}: {
  children: JSX.Element;
}): JSX.Element {
  const segments = useSegments();
  const router = useRouter();

  const inAuthGroup = segments[0] === "(auth)";

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const fetchUserData = useCallback(async () => {
    const session = await AsyncStorage.getItem("session");
    if (!session) {
      return null;
    }
    const userRequest = await sendApiRequest("POST", "session", {
      token: session,
    });
    if (userRequest?.current) {
      return userRequest;
    }
    return null;
  }, []);

  useEffect(() => {
    fetchUserData().then((sessionData) => {
      setUser(sessionData);
      router.push(!sessionData && !inAuthGroup ? "/auth/login" : "/home");
      setLoading(false);
    });
  }, [fetchUserData, inAuthGroup, router]);

  const authContext: AuthType = {
    user,
    setUser,
  };

  return (
    <AuthContext.Provider value={authContext}>
      {loading ? (
        <View flex={1} jc="center" height="100%">
          <Spinner size="large" color="$gray10" />
        </View>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
