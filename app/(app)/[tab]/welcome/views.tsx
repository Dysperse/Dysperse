import { COLLECTION_VIEWS } from "@/components/layout/command-palette/list";
import { useColorTheme } from "@/ui/color/theme-provider";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { Image } from "expo-image";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { MenuButton } from "../../home";

export default function Page() {
  const theme = useColorTheme();

  const order = [
    "list",
    "kanban",
    "grid",
    "planner",
    "skyline",
    "stream",
    "workload",
    "matrix",
    "calendar",
    "map",
  ];

  return (
    <>
      <MenuButton gradient back />
      <ScrollView
        keyboardShouldPersistTaps="handled"
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
          Like your everyday{"\n"}web browser
        </Text>
        <Text
          style={{
            opacity: 0.6,
            color: theme[11],
            marginTop: 5,
            fontSize: 20,
            marginBottom: 10,
          }}
          weight={600}
        >
          Open tabs for your collections, drag 'em around, and find your flow
        </Text>

        {[...Array(10)].map((_, i) => (
          <View
            key={i}
            style={{
              backgroundColor: theme[3],
              borderRadius: 20,
              marginTop: 10,
              overflow: "hidden",
              padding: 10,
              gap: 50,
              flexDirection: "row",
            }}
          >
            <View style={{ flex: 1, padding: 20 }}>
              <Icon style={{ marginBottom: 10 }} size={30}>
                {COLLECTION_VIEWS[order[i]]?.icon || "view_carousel"}
              </Icon>
              <Text
                style={{
                  color: theme[11],
                  fontFamily: "serifText800",
                  fontSize: 25,
                }}
              >
                {capitalizeFirstLetter(order[i])}
              </Text>
              <Text
                style={{
                  marginTop: 3,
                  color: theme[11],
                  fontSize: 20,
                  opacity: 0.6,
                }}
              >
                {COLLECTION_VIEWS[order[i]]?.description}
              </Text>
            </View>
            <Image
              source={{ uri: `https://dysperse.com/views/${i + 1}.png` }}
              style={{ width: 130, aspectRatio: 500 / 750, borderRadius: 20 }}
            />
          </View>
        ))}
      </ScrollView>
    </>
  );
}
