import { Stack } from "expo-router/stack";
import AccountNavbar from "../../../ui/account-navbar";
import Navbar from "../../../ui/navbar";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        header: (props) => <Navbar {...props} />,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "Spaces",
          presentation: "modal",
        }}
      />
      <Stack.Screen name="[space]" />
    </Stack>
  );
}
