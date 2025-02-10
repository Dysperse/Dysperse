import themeDescriptions from "@/components/themes.json";
import { Button } from "@/ui/Button";
import { useColor, useDarkMode } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Text from "@/ui/Text";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Animated, { FadeIn } from "react-native-reanimated";

function Color() {
  const theme = useColorTheme();
  const isDark = useDarkMode();
  const params = useLocalSearchParams();

  const [selected, setSelected] = useState("");

  const ruby = useColor("ruby");
  const grass = useColor("grass");
  const gold = useColor("gold");

  return (
    <View
      style={{
        padding: 20,
        flex: 1,
        justifyContent: "center",
      }}
    >
      <Animated.View entering={FadeIn.delay(300)}>
        <Text variant="eyebrow">4/5</Text>
        <Text
          style={{
            fontFamily: "serifText700",
            fontSize: 45,
            marginTop: 10,
            color: theme[11],
          }}
        >
          Pick a theme
        </Text>
      </Animated.View>
      <Animated.View entering={FadeIn.delay(600)}>
        <Text
          style={{
            opacity: 0.4,
            fontSize: 25,
            marginTop: 5,
            marginBottom: 15,
            color: theme[11],
          }}
          weight={600}
        >
          Dysperse has 30+ themes—{"\n"}Here's three for now.
        </Text>
      </Animated.View>
      <Animated.View
        entering={FadeIn.delay(900)}
        style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}
      >
        {[
          { color: ruby, name: "crimson" },
          { color: grass, name: "grass" },
          { color: gold, name: "gold" },
        ].map((theme, index) => (
          <Animated.View
            entering={FadeIn.delay(900 + index * 100)}
            key={theme.name}
            style={{
              flex: 1,
              height: 200,
              borderRadius: 20,
              padding: 20,
              backgroundColor: theme.color[4],
              justifyContent: "center",
              borderWidth: 2,
              overflow: "hidden",
              borderColor: theme.color[selected === theme.name ? 11 : 4],
            }}
          >
            <Button
              onPress={() => setSelected(theme.name)}
              key={theme.name}
              height={190}
              containerStyle={{ borderRadius: 20 }}
              style={{
                flex: 1,
                paddingHorizontal: 0,
                borderRadius: 20,
                flexDirection: "column",
                backgroundColor: theme.color[4],
                justifyContent: "center",
              }}
            >
              <Image
                source={{
                  uri: `https://assets.dysperse.com/themes/${
                    isDark ? "dark/" : ""
                  }${theme.name}.svg?`,
                }}
                style={{ width: 100, height: 100 }}
              />
              <Text
                style={{
                  color: theme.color[11],
                  fontFamily: "serifText700",
                  fontSize: 20,
                  textAlign: "center",
                  marginTop: 10,
                }}
              >
                {themeDescriptions[theme.name].name.split(" ").join("\n")}
              </Text>
            </Button>
          </Animated.View>
        ))}
      </Animated.View>
      <Animated.View entering={FadeIn.delay(1200)}>
        <Button
          height={65}
          variant="filled"
          style={{ margin: 20 }}
          text="Next"
          containerStyle={!selected.trim() && { opacity: 0.6 }}
          icon="east"
          iconPosition="end"
          bold
          disabled={!selected.trim()}
          onPress={() => {
            router.push({
              pathname: "/auth/join/5",
              params: { ...params, theme: selected },
            });
          }}
        />
      </Animated.View>
    </View>
  );
}

export default function Page() {
  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
    >
      <Color />
    </KeyboardAwareScrollView>
  );
}
