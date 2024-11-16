import { useUser } from "@/context/useUser";
import { hslToHex } from "@/helpers/hslToHex";
import { Image } from "expo-image";
import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import Icon, { DIconProps } from "../Icon";
import Text from "../Text";
import { useColor } from "../color";
import { useColorTheme } from "../color/theme-provider";

interface DAvatarProps extends PressableProps {
  image?: string;
  size?: number;
  viewClassName?: string;
  style?:
    | StyleProp<ViewStyle>
    | (({ pressed, hovered }) => StyleProp<ViewStyle>);
  theme?: string;
  icon?: string;
  iconProps?: DIconProps;
}
const styles = StyleSheet.create({
  container: {
    borderRadius: 99,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    position: "absolute",
    zIndex: 2,
  },
  view: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export function Avatar(props: DAvatarProps) {
  const { session } = useUser();
  const theme = useColor(
    props.theme || session?.user?.profile?.theme || "mint"
  );

  return (
    <Pressable
      {...props}
      style={({ pressed, hovered }) => [
        styles.container,
        {
          width: props.size || 30,
          height: props.size || 30,
          backgroundColor: theme[5],
        },
        typeof props.style === "function"
          ? props.style({ pressed, hovered })
          : props.style,
      ]}
    >
      <View
        style={[
          styles.view,
          { width: props.size || 30, height: props.size || 30 },
        ]}
      >
        {props.children ||
          ((
            <Icon style={{ color: theme[11] }} {...props.iconProps}>
              {props.icon}
            </Icon>
          ) as any)}
      </View>
      {props.image && <Image source={props.image} style={styles.image} />}
    </Pressable>
  );
}

export const ProfilePicture = function ProfilePicture({
  name,
  image,
  size,
  style,
  onPress = () => {},
  disabled = false,
}: {
  name: string;
  image?: string;
  size: number;
  style?:
    | StyleProp<ViewStyle>
    | (({ pressed, hovered }) => StyleProp<ViewStyle>);
  onPress?: () => void;
  disabled?: boolean;
}) {
  const theme = useColorTheme();

  return (
    <Avatar
      image={
        image
          ? image
          : `https://hostedboringavatars.vercel.app/api/beam/?${new URLSearchParams(
              {
                name,
                colors: [theme[5], theme[11]]
                  .map((t) =>
                    hslToHex(
                      ...(t
                        .replace("hsl", "")
                        .replace("(", "")
                        .replace(")", "")
                        .replaceAll("%", "")
                        .split(",")
                        .map(Number) as [number, number, number])
                    )
                  )
                  .join(","),
              }
            )}`
      }
      size={size}
      style={style}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={{ fontSize: size / 2.5 }} weight={600}>
        {name[0]?.toUpperCase()}
        {name[1]?.toUpperCase()}
      </Text>
    </Avatar>
  );
};

