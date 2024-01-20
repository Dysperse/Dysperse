import { Image, ImageStyle } from "expo-image";
import { memo } from "react";
import { StyleProp } from "react-native";

function Emoji({
  size = 24,
  emoji,
  style = {},
}: {
  size?: number;
  emoji: string;
  style?: StyleProp<ImageStyle>;
}) {
  return (
    <Image
      style={[
        {
          width: size,
          height: size,
        },
        style,
      ]}
      source={`https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/${emoji?.toLowerCase()}.png`}
    />
  );
}
export default memo(Emoji);
