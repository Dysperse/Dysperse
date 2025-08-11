import { ArcSystemBar } from "@/components/layout/arcAnimations";
import { useColorTheme } from "@/ui/color/theme-provider";
import Text from "@/ui/Text";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { MenuButton } from "../../home";

export default function Page() {
  const theme = useColorTheme();

  return (
    <>
      <MenuButton gradient back />
      <ArcSystemBar />
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
          Sort labels into collections
        </Text>

        {[
          "You can use the same label in multiple collections",
          'Use the "Everything" collection to see all your tasks, regardless of their label',
          "Share collections with others to collaborate on tasks",
          "Publish your collection as a template to share with the community",
        ].map((text, i) => (
          <View
            key={i}
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              marginTop: 10,
            }}
          >
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: theme[5],
                justifyContent: "center",
                alignItems: "center",
                marginRight: 10,
                marginTop: 3,
              }}
            >
              <Text
                style={{
                  color: theme[11],
                  fontSize: 14,
                }}
                weight={600}
              >
                {i + 1}
              </Text>
            </View>
            <Text
              style={{
                color: theme[11],
                opacity: 0.9,
                fontSize: 16,
                flex: 1,
              }}
            >
              {text}
            </Text>
          </View>
        ))}
      </ScrollView>
    </>
  );
}

