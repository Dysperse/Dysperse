import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, usePathname, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  ActivityIndicator,
  Button,
  SafeAreaView,
  Text,
  View,
} from "react-native";
import { sendApiRequest } from "../helpers/api";

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

export function IntroScreen() {
  const slug = usePathname();

  // useEffect(() => {
  //   if (Platform.OS === "android") {
  //     NavigationBar.setBackgroundColorAsync(primary10);
  //     NavigationBar.setBorderColorAsync(primary10);
  //     NavigationBar.setButtonStyleAsync("light");
  //   }
  // }, [primary10, Platform.OS]);

  return (
    <SafeAreaView>
      {slug === "/" && (
        <StatusBar style="dark" backgroundColor={"transparent"} />
      )}
      <Text>Welcome to Dysperse.</Text>
      <Text>We're here to redefine the standard for productivity</Text>
      <Link href="/auth/login" asChild>
        <Button title="Get started" />
      </Link>
    </SafeAreaView>
  );
}

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: any): JSX.Element {
  const segments = useSegments();

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
          <ActivityIndicator />
        </View>
      ) : user ? (
        children
      ) : (
        <IntroScreen />
      )}
    </AuthContext.Provider>
  );
}
