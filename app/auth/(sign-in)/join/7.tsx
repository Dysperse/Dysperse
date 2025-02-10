import { useColorTheme } from "@/ui/color/theme-provider";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { View } from "react-native";

export default function Page() {
  const theme = useColorTheme();

  return (
    <View style={{ flexGrow: 1, justifyContent: "center" }}>
      <Text
        style={{
          fontFamily: "serifText700",
          fontSize: 45,
          marginTop: 10,
          color: theme[11],
        }}
      >
        Hang tight...
      </Text>
      <Text
        style={{
          opacity: 0.4,
          fontSize: 25,
          marginTop: 5,
          marginBottom: 15,
          color: theme[11],
        }}
        weight={600}
      >
        We're creating your account!
      </Text>
      <View
        style={{
          backgroundColor: theme[2],
          padding: 20,
          borderRadius: 20,
        }}
      >
        <Spinner size={30} />
      </View>
    </View>
  );
}
