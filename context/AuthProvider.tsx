import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect, useRouter, useSegments } from "expo-router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Spinner, View } from "tamagui";
import { sendApiRequest } from "../helpers/api";

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

export function AuthProvider({ children }: any): JSX.Element {
  const segments = useSegments();
  const router = useRouter();

  const inAuthGroup = segments[0] === "(auth)";

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const fetchUserData = useCallback(async () => {
    const token = await AsyncStorage.getItem("session");
    if (!token) {
      return null;
    }
    const userRequest = await sendApiRequest("POST", "session", { token });
    if (userRequest?.current) {
      return userRequest;
    }
    return null;
  }, []);

  useEffect(() => {
    fetchUserData().then(() => {
      setLoading(false);
    });
  }, []);

  const authContext: AuthType = {
    user,
    setUser,
  };

  return (
    <AuthContext.Provider value={authContext}>
      {inAuthGroup ? (
        children
      ) : loading ? (
        <View flex={1} jc="center" height="100%">
          <Spinner size="large" color="$gray10" />
        </View>
      ) : user ? (
        children
      ) : (
        !inAuthGroup && <Redirect href={"/auth/login"} />
      )}
    </AuthContext.Provider>
  );
}
