import { useUser } from "@/context/useUser";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  TextStyle,
  ViewStyle,
} from "react-native";
import { useColor } from "../color";
import { useColorTheme } from "../color/theme-provider";
import Icon from "../Icon";
import IconButton from "../IconButton";
import Text from "../Text";

interface ChipProps {
  icon?: React.ReactNode;
  label?: React.ReactNode;
  onPress?: () => void;
  outlined?: boolean;
  style?: StyleProp<ViewStyle> | ((props: any) => StyleProp<ViewStyle>);
  iconPosition?: "before" | "after";
  dense?: boolean;
  disabled?: boolean;
  color?: string;
  textStyle?: StyleProp<TextStyle>;
  colorTheme?: string;
  textWeight?: number;
  onDismiss?: () => void;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 999,
  },
});

export default function Chip({
  icon,
  label,
  onPress,
  outlined = false,
  style = {},
  iconPosition = "before",
  dense = false,
  color,
  textStyle = {},
  disabled = false,
  colorTheme,
  textWeight = 400,
  onDismiss,
}: ChipProps) {
  const { session } = useUser();
  const colorScheme = useColorTheme();

  const specifiedTheme = useColor(
    colorTheme || session?.user?.profile?.theme || "mint",
  );

  const theme = colorTheme ? specifiedTheme : colorScheme;

  return (
    <Pressable
      disabled={disabled}
      style={({ hovered, pressed }: any) => [
        styles.container,
        {
          paddingHorizontal: dense ? 5 : 10,
          ...(icon && { paddingRight: dense ? 7 : 12 }),
          height: dense ? 30 : 35,
          ...(outlined
            ? {
                backgroundColor: pressed
                  ? theme[5]
                  : hovered
                    ? theme[4]
                    : undefined,
                borderColor: theme[pressed ? 5 : hovered ? 4 : 3],
              }
            : {
                borderColor: "transparent",
                backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
              }),
          gap: dense ? 5 : 10,
        },
        typeof style === "function" ? style({ pressed, hovered }) : style,
      ]}
      {...(onPress && { onPress })}
    >
      {iconPosition === "before" &&
        (typeof icon === "string" ? <Icon>{icon}</Icon> : icon)}
      {typeof label === "string" ? (
        <Text
          style={[
            {
              color: color || theme[11],
              ...(dense && { fontSize: 13 }),
            },
            textStyle,
          ]}
          weight={textWeight as any}
        >
          {label}
        </Text>
      ) : (
        label
      )}
      {iconPosition === "after" &&
        (typeof icon === "string" ? <Icon>{icon}</Icon> : icon)}

      {onDismiss && (
        <IconButton
          onPress={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          icon="close"
          style={{ marginRight: -5 }}
          size={dense ? 20 : 33}
        />
      )}
    </Pressable>
  );
}
