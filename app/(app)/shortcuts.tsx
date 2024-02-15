import { ContentWrapper } from "@/components/layout/content";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { router } from "expo-router";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

export default function Page() {
  const theme = useColorTheme();

  const shortcuts = [
    {
      name: "Tab management",
      shorcuts: [
        {
          keys: "ctrl+tab",
          action: "Switch to the next tab",
        },
        {
          keys: "ctrl+shift+tab",
          action: "Switch to the previous tab",
        },
        {
          keys: "ctrl+[0-9]",
          action: "Switch to the specified tab",
        },
      ],
    },
  ];
  return (
    <ContentWrapper>
      <IconButton
        size={55}
        variant="outlined"
        icon="close"
        onPress={() => {
          if (router.canGoBack()) router.back();
          else router.push("/");
        }}
        style={{ margin: 20 }}
      />
      <ScrollView
        style={{ padding: 20, paddingTop: 50 }}
        contentContainerStyle={{ alignItems: "center" }}
      >
        <Text weight={600} style={{ fontSize: 50 }}>
          Shortcuts
        </Text>
        {shortcuts.map((group) => (
          <View key={group.name}>
            <Text
              variant="eyebrow"
              weight={600}
              style={{ fontSize: 30, marginTop: 20, textAlign: "center" }}
            >
              {group.name}
            </Text>
            <View style={{ marginTop: 10 }}>
              {group.shorcuts.map((shortcut) => (
                <View
                  key={shortcut.keys}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 100,
                    marginBottom: 5,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      color: theme[11],
                      marginRight: "auto",
                    }}
                  >
                    {shortcut.keys}
                  </Text>
                  <Text style={{ fontSize: 20, marginLeft: 10 }}>
                    {shortcut.action}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </ContentWrapper>
  );
}
