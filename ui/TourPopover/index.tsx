import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";
import { RenderProps } from "react-native-spotlight-tour";
import { useColorTheme } from "../color/theme-provider";
import Icon from "../Icon";
import IconButton from "../IconButton";
import Text from "../Text";

export default function TourPopover(
  props: RenderProps & {
    description: string;
  }
) {
  const theme = useColorTheme();

  return (
    <View
      style={{
        margin: 10,
        width: 200,
        borderRadius: 20,
        overflow: "hidden",
        backgroundColor: theme[3],
        shadowColor: theme[11],
        shadowRadius: 20,
        shadowOpacity: 0.2,
        shadowOffset: { width: 10, height: 10 },
      }}
    >
      <LinearGradient
        colors={[theme[3], theme[4]]}
        style={{
          paddingHorizontal: 15,
          paddingVertical: 10,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Icon bold>emoji_objects</Icon>
        <Text
          style={{
            marginTop: 2,
            flex: 1,
            fontFamily: "serifText700",
            color: theme[11],
            fontSize: 16,
          }}
        >
          Tip #{props.current + 1}
        </Text>

        <View style={{ flex: 1, flexDirection: "row" }}>
          <IconButton
            icon="west"
            size={40}
            style={{ height: 30 }}
            iconProps={{ size: 20, bold: true }}
            disabled={props.isFirst}
            onPress={props.previous}
          />
          <IconButton
            icon={props.isLast ? "check" : "east"}
            size={40}
            style={{ height: 30, marginLeft: -5 }}
            iconProps={{ size: 20, bold: true }}
            onPress={props.next}
          />
        </View>
      </LinearGradient>

      <View style={{ padding: 20, paddingVertical: 10 }}>
        <Text style={{ color: theme[11], fontSize: 15 }} weight={600}>
          {props.description}
        </Text>
      </View>
    </View>
  );
}
