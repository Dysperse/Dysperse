import { Image } from "expo-image";
import { PressableProps, View } from "react-native";
import { Pressable } from "react-native";
import Text from "../Text";

interface DAvatarProps extends PressableProps {
  image?: string;
  size?: number;
}

export function Avatar(props: DAvatarProps) {
  return (
    <Pressable
      {...props}
      className="rounded-full relative items-center justify-center"
      style={{
        width: props.size,
        height: props.size,
      }}
    >
      <View className="absolute w-full h-full rounded-full items-center justify-center">
        {props.children as any}
      </View>
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

export function ProfilePicture({ name, image, size }) {
  return (
    <Avatar image={image ? image : undefined} size={size}>
      <Text>
        {name[0].toUpperCase()}
        {name[1].toUpperCase()}
      </Text>
    </Avatar>
  );
}
