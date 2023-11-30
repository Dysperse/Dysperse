import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect, useRouter, useSegments } from "expo-router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { sendApiRequest } from "../helpers/api";
import { View } from "react-native";
import { Spinner } from "@gluestack-ui/themed";

type User = {
  name: string;
};

type AuthType = {
  session: any;
  setUser: (user: User | null) => void;
};

const AuthContext = createContext<AuthType>({
  session: null,
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
    fetchUserData().then((e) => {
      if (e) setUser(e);
      setLoading(false);
    });
  }, []);

  const authContext: AuthType = {
    session: user,
    setUser,
  };

  return (
    <AuthContext.Provider value={authContext}>
      {inAuthGroup ? (
        children
      ) : loading ? (
        <View style={{ flex: 1, justifyContent: "center", height: "100%" }}>
          <Spinner size="large" color="$gray10" />
        </View>
      ) : user ? (
        children
      ) : (
        <Redirect href={"/auth/login"} />
      )}
    </AuthContext.Provider>
  );
}
