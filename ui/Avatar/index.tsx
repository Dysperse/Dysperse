import { Image } from "expo-image";
import { PressableProps, StyleProp, View, ViewStyle } from "react-native";
import { Pressable } from "react-native";
import Text from "../Text";
import { useColorTheme } from "../color/theme-provider";

interface DAvatarProps extends PressableProps {
  image?: string;
  size?: number;
  viewClassName?: string;
  style?: StyleProp<ViewStyle>;
}

export function Avatar(props: DAvatarProps) {
  const theme = useColorTheme();
  return (
    <Pressable
      {...props}
      style={[
        {
          borderRadius: 99,
          width: props.size || 30,
          height: props.size || 30,
          backgroundColor: theme[5],
        },
        props.style,
      ]}
    >
      <View>{props.children as any}</View>
      {props.image && (
        <Image
          source={props.image}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 999,
            position: "absolute",
            zIndex: 2,
          }}
        />
      )}
    </Pressable>
  );
}

export function ProfilePicture({
  name,
  image,
  size,
  style,
}: {
  name: string;
  image?: string;
  size: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Avatar image={image ? image : undefined} size={size} style={style}>
      <Text>
        {name[0].toUpperCase()}
        {name[1].toUpperCase()}
      </Text>
    </Avatar>
  );
}
