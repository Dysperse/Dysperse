import { collectionViews } from "@/components/layout/command-palette/list";
import { SettingsLayout } from "@/components/settings/layout";
import { settingStyles } from "@/components/settings/settingsStyles";
import Divider from "@/ui/Divider";
import Text, { getFontName } from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

export default function Page() {
  const theme = useColorTheme();

  const shortcuts = [
    {
      name: "Tab management",
      shorcuts: [
        {
          keys: "ctrl+t",
          action: "New tab",
        },
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
    {
      name: "Collections",
      subheading:
        "Open a collection to use these shortcuts & toggle between views",
      shorcuts: [
        {
          keys: "/",
          action: "Search",
        },
        {
          keys: "ctrl+f",
          action: "Search",
        },
        {
          keys: "ctrl+⬅",
          action: "Previous planner view",
        },
        {
          keys: "ctrl+⬆",
          action: "Go to today",
        },
        {
          keys: "ctrl+➡",
          action: "Next planner view",
        },
        ...Object.keys(collectionViews).map((key) => ({
          keys: key[0],
          action: `${capitalizeFirstLetter(key)} view`,
        })),
      ],
    },
    {
      name: "Tasks & items",
      shorcuts: [
        {
          keys: "shift+n",
          action: "Create tasks",
        },
        {
          keys: "#",
          action: "Open label picker",
        },
        {
          keys: "@",
          action: "Open date picker",
        },
        {
          keys: "/",
          action: "Add attachment",
        },
      ],
    },
  ];
  return (
    <SettingsLayout>
      <ScrollView>
        <Text style={settingStyles.title}>Shortcuts</Text>
        {shortcuts.map((group, index) => (
          <View key={group.name}>
            <Text style={settingStyles.heading}>{group.name}</Text>
            {group.subheading && (
              <Text style={{ fontSize: 20, opacity: 0.6, marginBottom: 10 }}>
                {group.subheading}
              </Text>
            )}
            <View style={{ marginTop: 10 }}>
              {group.shorcuts.map((shortcut, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 20,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      color: theme[11],
                      fontFamily: getFontName("jetBrainsMono", 500),
                    }}
                  >
                    {shortcut.keys}
                  </Text>
                  <Text
                    style={{ fontSize: 20, marginLeft: "auto" }}
                    weight={200}
                  >
                    {shortcut.action}
                  </Text>
                </View>
              ))}
            </View>
            {index !== shortcuts.length - 1 && (
              <Divider style={{ marginTop: 10 }} />
            )}
          </View>
        ))}
      </ScrollView>
    </SettingsLayout>
  );
}
