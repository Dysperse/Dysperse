import { useUser } from "@/context/useUser";
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

const getInitials = (name: string | null | undefined) => {
  if (!name) return "";
  const parts = name.split(" ");
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "";
  return `${parts[0][0]?.toUpperCase() || ""}${
    parts[1][0]?.toUpperCase() || ""
  }`;
};

interface DAvatarProps extends PressableProps {
  image?: string;
  size?: number;
  viewClassName?: string;
  name?: string;
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
    zIndex: 9,
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
        {props.children ? (
          props.children
        ) : props.name ? (
          <Text
            style={{
              color: theme[11],
              fontSize: (props.size || 30) / 2.5,
            }}
            weight={600}
          >
            {props.name ? getInitials(props.name) : ""}
          </Text>
        ) : (
          ((
            <Icon style={{ color: theme[11] }} {...props.iconProps}>
              {props.icon}
            </Icon>
          ) as any)
        )}
      </View>
      {props.image && (
        <Image
          source={props.image}
          style={[styles.image, { backgroundColor: theme[3] }]}
        />
      )}
    </Pressable>
  );
}

export const ProfilePicture = function ProfilePicture({
  name,
  image,
  size,
  style,
  onPress = () => {},
  disabled = true,
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
  return (
    <Avatar
      image={
        image
          ? image
          : `https://api.dicebear.com/9.x/notionists/svg?seed=${name}`
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

