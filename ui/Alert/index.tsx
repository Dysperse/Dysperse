import { StyleProp, View, ViewStyle } from "react-native";
import Emoji from "../Emoji";
import Text from "../Text";
import { useColorTheme } from "../color/theme-provider";

interface AlertProps {
  emoji: string;
  title: string;
  subtitle?: string;
  style?: StyleProp<ViewStyle>;
  dense?: boolean;
  italicize?: boolean;
  direction?: "row" | "column";
}

export default function Alert({
  emoji,
  title,
  subtitle,
  style,
  dense,
  italicize,
  direction = "row",
}: AlertProps) {
  const theme = useColorTheme();

  return (
    <View
      style={[
        {
          backgroundColor: theme[3],
          padding: 20,
          paddingHorizontal: 30,
          borderRadius: 25,
          flexDirection: direction,
          alignItems: "center",
          justifyContent: "flex-start",
          marginBottom: 20,
          gap: 25,
        },
        style,
      ]}
    >
      <Emoji
        emoji={emoji}
        size={direction === "row" ? (dense ? 24 : 30) : 50}
      />
      <View style={{ flex: 1 }}>
        <Text
          style={{
            textAlign: direction === "row" ? "left" : "center",
            fontSize: dense ? 16 : 20,
            fontStyle: italicize ? "italic" : "normal",
          }}
          weight={dense ? 400 : 800}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{
              opacity: 0.7,
              marginTop: 5,
              textAlign: direction === "row" ? "left" : "center",
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
}
