import { ArcSystemBar } from "@/components/layout/arcAnimations";
import { useColorTheme } from "@/ui/color/theme-provider";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { MenuButton } from "../../home";

export default function Page() {
  const theme = useColorTheme();

  const cardStyle = {
    padding: 20,
    borderRadius: 20,
    backgroundColor: theme[3],
    flexDirection: "row",
    gap: 10,
    columnGap: 20,
    alignItems: "center",
    marginTop: 10,
  };

  return (
    <View>
      <MenuButton gradient back />
      <ArcSystemBar />
      <ScrollView
        contentContainerStyle={{
          paddingVertical: 100,
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
          Every big win starts with one small task.
        </Text>

        <Text variant="eyebrow" style={{ marginTop: 20 }}>
          Four ways to create
        </Text>
        <View style={cardStyle}>
          <Icon bold>stylus_note</Icon>
          <View>
            <Text weight={900} style={{ color: theme[11] }}>
              Write it
            </Text>
            <Text style={{ color: theme[11] }}>
              We'll recognize dates and times!
            </Text>
          </View>
        </View>
        <View style={cardStyle}>
          <Icon bold>mic</Icon>
          <View>
            <Text weight={900} style={{ color: theme[11] }}>
              Speak it
            </Text>
            <Text style={{ color: theme[11] }}>
              Tap & hold on the create button
            </Text>
          </View>
        </View>
        <View style={cardStyle}>
          <Icon bold>email</Icon>
          <View>
            <Text weight={900} style={{ color: theme[11] }}>
              Forward it
            </Text>
            <Text style={{ color: theme[11] }}>
              Send an email to{"\n"}tasks@dysperse.com
            </Text>
          </View>
        </View>
        <View style={cardStyle}>
          <Icon bold>extension</Icon>
          <Text style={{ color: theme[11] }} weight={900}>
            Get our Chrome extension
          </Text>
        </View>

        <Text variant="eyebrow" style={{ marginTop: 50 }}>
          Never forget important stuff
        </Text>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={[cardStyle, { flex: 1, flexDirection: "column" }]}>
            <Icon>push_pin</Icon>
            <Text style={{ color: theme[11], textAlign: "center" }}>
              Pin what matters
            </Text>
          </View>
          <View style={[cardStyle, { flex: 1, flexDirection: "column" }]}>
            <Icon>alarm</Icon>
            <Text style={{ color: theme[11], textAlign: "center" }}>
              Set multiple reminders
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={[cardStyle, { flex: 1, flexDirection: "column" }]}>
            <Icon>note_stack</Icon>
            <Text style={{ color: theme[11], textAlign: "center" }}>
              Attach notes & images
            </Text>
          </View>
          <View style={[cardStyle, { flex: 1, flexDirection: "column" }]}>
            <Icon>near_me</Icon>
            <Text style={{ color: theme[11], textAlign: "center" }}>
              Save key locations
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={[cardStyle, { flex: 1, flexDirection: "column" }]}>
            <Icon>ios_share</Icon>
            <Text style={{ color: theme[11], textAlign: "center" }}>
              Share with anyone
            </Text>
          </View>
          <View style={[cardStyle, { flex: 1, flexDirection: "column" }]}>
            <Icon>exercise</Icon>
            <Text style={{ color: theme[11], textAlign: "center" }}>
              Sort by difficulty
            </Text>
          </View>
        </View>

        <Text variant="eyebrow" style={{ marginTop: 50 }}>
          Are you a student?
        </Text>

        <View style={[cardStyle, { gap: 20, paddingHorizontal: 20 }]}>
          <Icon bold>cloud</Icon>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme[11] }} weight={900}>
              Connect your Canvas account
            </Text>
            <Text style={{ color: theme[11] }}>
              View your assignments, quizzes, and more directly from here
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

