import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
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

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 20,
    gap: 25,
  },
  subtitle: {
    opacity: 0.7,
    marginTop: 5,
  },
});

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
        styles.container,
        { flexDirection: direction, backgroundColor: theme[3] },
        style,
      ]}
    >
      {emoji && (
        <Emoji
          emoji={emoji}
          size={direction === "row" ? (dense ? 24 : 30) : 50}
        />
      )}
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
            style={[
              styles.subtitle,
              {
                textAlign: direction === "row" ? "left" : "center",
              },
            ]}
          >
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
}

