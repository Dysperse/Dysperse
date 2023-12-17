import { Image } from "expo-image";

export default function Emoji({
  size = 24,
  emoji,
  style = {},
  className = "",
}) {
  return (
    <Image
      className={className}
      style={{
        ...style,
        width: size,
        height: size,
      }}
      source={`https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/${emoji.toLowerCase()}.png`}
    />
  );
}
