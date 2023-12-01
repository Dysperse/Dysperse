import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, Redirect, useRouter, useSegments } from "expo-router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { sendApiRequest } from "../helpers/api";
import { Text, View } from "react-native";
import {
  Box,
  Button,
  ButtonText,
  Heading,
  Spinner,
} from "@gluestack-ui/themed";

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

function IntroScreen() {
  return (
    <Box padding="$7" justifyContent="flex-end" height="100%">
      <Heading
        size="5xl"
        lineHeight={70}
        textTransform="uppercase"
        fontFamily={"heading" as any}
        fontWeight={500 as any}
      >
        Welcome to Dysperse.
      </Heading>
      <Heading>We're here to redefine the standard for productivity</Heading>
      <Link href="/auth/login" asChild>
        <Button marginTop="$3" borderRadius={99}>
          <ButtonText>Get started</ButtonText>
        </Button>
      </Link>
    </Box>
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
          <Spinner size="large" color="$gray10" />
        </View>
      ) : user ? (
        children
      ) : (
        <IntroScreen />
      )}
    </AuthContext.Provider>
  );
}
