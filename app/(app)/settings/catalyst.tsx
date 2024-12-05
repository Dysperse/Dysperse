import { useColorTheme } from "@/ui/color/theme-provider";
import Text from "@/ui/Text";
import { ImageBackground } from "expo-image";

export default function Page() {
  const theme = useColorTheme();

  return (
    <ImageBackground
      style={{
        padding: 20,
        borderRadius: 50,
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 50,
        overflow: "hidden",
        backgroundColor: theme[3],
      }}
      source={{ uri: "https://www.fffuel.co/images/gggrain/gggrain-12.svg" }}
    >
      <Text
        style={{
          fontFamily: "serifText800",
          textShadowColor: "#000",
          textShadowOffset: { width: 1, height: 5 },
          textShadowRadius: 30,
          color: "#fff",
          fontSize: 50,
        }}
      >
        catalyst
      </Text>
      <Text style={{ opacity: 0.6, fontSize: 20, marginTop: 5, color: "#fff" }}>
        arriving 2025
      </Text>
    </ImageBackground>
  );
}
