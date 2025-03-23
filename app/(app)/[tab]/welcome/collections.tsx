import { useColorTheme } from "@/ui/color/theme-provider";
import Text from "@/ui/Text";
import { Image } from "expo-image";
import { View } from "react-native";
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
          Collections
        </Text>
        <View
          style={{
            backgroundColor: theme[3],
            padding: 20,
            borderRadius: 20,
            marginTop: 10,
          }}
        >
          <Text style={{ color: theme[11] }} weight={600}>
            Collections are groups of labels
          </Text>
        </View>
        <View
          style={{
            backgroundColor: theme[3],
            padding: 20,
            borderRadius: 20,
            marginTop: 10,
          }}
        >
          <Text style={{ color: theme[11] }} weight={600}>
            You can use the same label in multiple collections
          </Text>
        </View>

        <Image
          source={{ uri: "https://s6.imgcdn.dev/YjKVh0.png" }}
          style={{
            width: "100%",
            aspectRatio: 1563 / 731,
            borderRadius: 20,
            marginTop: 20,
          }}
        />
      </ScrollView>
    </>
  );
}
