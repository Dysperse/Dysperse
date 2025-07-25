import themeDescriptions from "@/components/themes.json";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import { useColor, useDarkMode } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Text from "@/ui/Text";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Keyboard, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSignupContext } from "../_layout";

function Color() {
  const theme = useColorTheme();
  const isDark = useDarkMode();
  const store = useSignupContext();
  const breakpoints = useResponsiveBreakpoints();
  const [selected, setSelected] = useState(store.theme);

  const ruby = useColor("ruby");
  const grass = useColor("grass");
  const gold = useColor("gold");

  useEffect(() => {
    store.theme = selected;
  }, [store, selected]);

  return (
    <View
      style={{
        padding: 20,
        paddingHorizontal: 30,
        paddingTop: 115,
        flex: 1,
      }}
    >
      <Animated.View entering={FadeIn.delay(300)}>
        <Text variant="eyebrow">4/5</Text>
        <Text
          style={{
            fontFamily: "serifText700",
            fontSize: breakpoints.md ? 40 : 30,
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
            fontSize: breakpoints.md ? 25 : 17,
            marginTop: 5,
            marginBottom: 15,
            color: theme[11],
          }}
          weight={600}
        >
          Dysperse has over 30 themes—{"\n"}Here's three for now.
        </Text>
      </Animated.View>
      <Animated.View
        entering={FadeIn.delay(900)}
        style={{
          flexDirection: breakpoints.md ? "row" : "column",
          gap: 10,
          marginBottom: 10,
        }}
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
              height: "auto",
              borderRadius: 20,
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
              height={breakpoints.md ? 220 : 100}
              containerStyle={{ borderRadius: 20 }}
              style={{
                flex: 1,
                paddingHorizontal: breakpoints.md ? 0 : 20,
                paddingVertical: 0,
                borderRadius: 20,
                flexDirection: !breakpoints.md ? "row" : "column",
                backgroundColor: theme.color[4],
                justifyContent: breakpoints.md ? "center" : "flex-start",
              }}
            >
              <Image
                source={{
                  uri: `https://assets.dysperse.com/themes/${
                    isDark ? "dark/" : ""
                  }${theme.name}.svg?`,
                }}
                style={{
                  width: breakpoints.md ? 100 : 80,
                  height: breakpoints.md ? 100 : 80,
                }}
              />
              <Text
                style={{
                  color: theme.color[11],
                  fontFamily: "serifText700",
                  fontSize: 20,
                  textAlign: breakpoints.md ? "center" : "left",
                  marginTop: breakpoints.md ? 10 : 0,
                }}
              >
                {themeDescriptions[theme.name].name.split(" ").join("\n")}
              </Text>
            </Button>
          </Animated.View>
        ))}
      </Animated.View>
      <Animated.View
        entering={FadeIn.delay(1200)}
        style={{ flexDirection: "row", gap: 10, marginTop: 10 }}
      >
        <Button
          height={65}
          variant="filled"
          text="Next"
          containerStyle={[!selected.trim() && { opacity: 0.6 }, { flex: 1 }]}
          icon="east"
          iconPosition="end"
          bold
          disabled={!selected.trim()}
          onPress={() => router.push("/auth/join/5")}
        />
      </Animated.View>
    </View>
  );
}

export default function Page() {
  return (
    <KeyboardAwareScrollView
      onScrollBeginDrag={Keyboard.dismiss}
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
    >
      <Color />
    </KeyboardAwareScrollView>
  );
}

