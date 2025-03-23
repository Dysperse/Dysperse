import { useColorTheme } from "@/ui/color/theme-provider";
import Text from "@/ui/Text";
import { ScrollView } from "react-native-gesture-handler";
import { MenuButton } from "../../home";

export default function Page() {
  const theme = useColorTheme();

  return (
    <>
      <MenuButton gradient back />
      <ScrollView
        contentContainerStyle={{
          paddingTop: 100,
          padding: 20,
          paddingHorizontal: 40,
        }}
      >
        <Text
          weight={900}
          style={{
            fontSize: 30,
            color: theme[11],
            fontFamily: "serifText700",
          }}
        >
          Ten beautiful views
        </Text>
      </ScrollView>
    </>
  );
}
