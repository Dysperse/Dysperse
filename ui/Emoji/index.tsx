import { Image } from "expo-image";

export default function Emoji({ size = 24, emoji, style = {} }) {
  return (
    <Image
      style={[
        {
          width: size,
          height: size,
        },
        style,
      ]}
      source={`https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/${emoji.toLowerCase()}.png`}
    />
  );
}
