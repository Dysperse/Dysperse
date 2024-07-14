import { settingStyles } from "@/components/settings/settingsStyles";
import themes from "@/components/themes.json";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import BottomSheet from "@/ui/BottomSheet";
import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import SettingsScrollView from "@/ui/SettingsScrollView";
import Text from "@/ui/Text";
import { ColorTheme, useColor, useDarkMode } from "@/ui/color";
import { ColorThemeProvider, useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { cloneElement, useCallback, useRef, useState } from "react";
import { Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import Toast from "react-native-toast-message";
import Swiper from "react-native-web-swiper";

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  button: { height: 80 },
  themeCardIcon: { textAlign: "center" },
  cardTitle: { fontSize: 30 },
  cardDescription: { opacity: 0.5, fontSize: 17 },
});

const themePickerStyles = StyleSheet.create({
  title: { textAlign: "center", fontSize: 50, lineHeight: 55, marginBottom: 5 },
  description: { height: 70, opacity: 0.6, textAlign: "center" },
  container: { alignItems: "center", height: "100%" },
  icon: { marginTop: "auto" },
  button: { height: 80, width: "100%" },
  hexagonList: { marginTop: "auto" },
  buttonText: { fontSize: 20 },
  hexagonButton: {
    alignItems: "center",
    paddingHorizontal: 10,
    justifyContent: "center",
  },
});

function ThemedSlide({
  theme,
  themeData,
  onSelect,
}: {
  theme: ColorTheme;
  themeData: { name: string; description: string };
  onSelect: () => void;
}) {
  const colors = useColor(theme);

  return (
    <ColorThemeProvider theme={colors}>
      <Pressable onPress={onSelect}>
        <Icon size={300} filled>
          hexagon
        </Icon>
      </Pressable>
      <Text weight={600} style={themePickerStyles.title}>
        {themeData.name}
      </Text>
      <Text style={themePickerStyles.description}>{themeData.description}</Text>
    </ColorThemeProvider>
  );
}
function ThemePicker({ children }: { children: React.ReactElement<any> }) {
  const ref = useRef<BottomSheetModal>(null);
  const { session, sessionToken, mutate } = useUser();
  const [selectedTheme, setSelectedTheme] = useState(
    session.user.profile.theme
  );

  const colors = useColor(selectedTheme);

  const theme = {
    ...themes[selectedTheme],
    colors,
  };

  const handleOpen = useCallback(() => ref.current?.present(), []);
  const trigger = cloneElement(children, { onPress: handleOpen });
  const handleClose = useCallback(() => ref.current?.close(), []);
  const [loading, setLoading] = useState(false);

  const handleSelect = async () => {
    try {
      sendApiRequest(
        sessionToken,
        "PUT",
        "user/profile",
        {},
        {
          body: JSON.stringify({
            color: selectedTheme,
          }),
        }
      );
      mutate(
        (oldData) => ({
          ...oldData,
          user: {
            ...oldData.user,
            profile: {
              ...oldData.user.profile,
              theme: selectedTheme,
            },
          },
        }),
        {
          revalidate: false,
        }
      );
      setTimeout(handleClose, 0);
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Something went wrong. Please try again later",
      });
      setLoading(false);
    }
  };
  const { height } = useWindowDimensions();
  const carouselRef = useRef<Swiper>();
  const dark = useDarkMode();

  return (
    <>
      {trigger}
      <BottomSheet
        enableContentPanningGesture={false}
        sheetRef={ref}
        snapPoints={[height - 20]}
        onClose={handleClose}
        backgroundStyle={{
          backgroundColor: theme.colors[4],
        }}
        backgroundComponent={(props) => (
          <LinearGradient
            {...props}
            style={[
              props.style,
              {
                borderRadius: 20,
              },
            ]}
            colors={[
              theme.colors[6],
              theme.colors[4],
              theme.colors[5],
              theme.colors[6],
            ]}
          />
        )}
        handleIndicatorStyle={{
          backgroundColor: theme.colors[8],
        }}
      >
        <View style={themePickerStyles.container}>
          <Text
            variant="eyebrow"
            style={{
              fontFamily: "monospace",
              marginTop: 5,
              fontSize: 20,
              color: theme.colors[11],
            }}
          >
            #{(theme.key + 1).toString().padStart(2, "0")}
          </Text>
          <Swiper
            containerStyle={{ width: "100%" }}
            innerContainerStyle={{
              width: "100%",
              height: "100%",
            }}
            from={Object.keys(themes).findIndex((e) => e === selectedTheme)}
            onIndexChanged={(e) => setSelectedTheme(Object.keys(themes)[e])}
            onAnimationEnd={() => {
              const i = carouselRef.current?.getActiveIndex();
              setSelectedTheme(Object.keys(themes)[i]);
            }}
            ref={carouselRef}
            controlsProps={
              {
                prevPos: "left",
                nextPos: "right",
                prevTitle: "<",
                nextTitle: ">",
                dotProps: { Component: () => null },
                NextComponent: (props) => (
                  <IconButton {...props} key={selectedTheme}>
                    <Icon
                      style={{
                        color: dark
                          ? "rgba(255,255,255,.5)"
                          : "rgba(0,0,0,0.5)",
                      }}
                    >
                      arrow_forward_ios
                    </Icon>
                  </IconButton>
                ),
                PrevComponent: (props) => (
                  <IconButton {...props} key={selectedTheme}>
                    <Icon
                      style={{
                        color: dark
                          ? "rgba(255,255,255,.5)"
                          : "rgba(0,0,0,0.5)",
                      }}
                    >
                      arrow_back_ios
                    </Icon>
                  </IconButton>
                ),
              } as any
            }
            springConfig={{ damping: 30, stiffness: 400 }}
          >
            {Object.keys(themes).map((theme: ColorTheme) => (
              <View
                key={theme}
                style={{
                  flex: 1,
                  alignItems: "center",
                  paddingHorizontal: 80,
                  justifyContent: "center",
                }}
              >
                <ThemedSlide
                  theme={theme}
                  themeData={themes[theme]}
                  onSelect={() => setSelectedTheme(theme)}
                />
              </View>
            ))}
          </Swiper>
          <View
            style={{
              padding: 20,
              gap: 20,
              width: "100%",
              alignItems: "center",
            }}
          >
            <Button
              style={({ pressed, hovered }) => [
                themePickerStyles.button,
                {
                  backgroundColor: theme.colors[pressed ? 8 : hovered ? 7 : 6],
                },
              ]}
              variant="filled"
              onPress={handleSelect}
              isLoading={loading}
            >
              <ButtonText
                weight={900}
                style={[
                  themePickerStyles.buttonText,
                  { color: theme.colors[11] },
                ]}
              >
                Select
              </ButtonText>
            </Button>
          </View>
        </View>
      </BottomSheet>
    </>
  );
}

export default function Page() {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const { session, mutate, sessionToken } = useUser();
  const themeText = themes[session?.user?.profile?.theme || "mint"];

  return (
    <SettingsScrollView>
      <Text style={settingStyles.title}>Appearance</Text>

      <Text style={settingStyles.heading}>Color</Text>
      <ThemePicker>
        <Pressable
          style={({ pressed, hovered }) => [
            styles.card,
            {
              backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
              borderColor: theme[pressed ? 7 : hovered ? 6 : 5],
              alignItems: "center",
              justifyContent: breakpoints.md ? undefined : "center",
              flexDirection: breakpoints.md ? "row" : "column",
              gap: breakpoints.md ? 20 : 10,
            },
            !breakpoints.md && {
              padding: 20,
            },
          ]}
        >
          <Icon
            style={[
              styles.themeCardIcon,
              !breakpoints.md && { marginBottom: -20 },
            ]}
            size={breakpoints.md ? 100 : 140}
          >
            hexagon
          </Icon>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.cardTitle,
                !breakpoints.md && { textAlign: "center" },
              ]}
              weight={900}
            >
              {themeText.name}
            </Text>
            <Text
              style={[
                styles.cardDescription,
                !breakpoints.md && { textAlign: "center" },
              ]}
              weight={500}
            >
              {themeText.description}
            </Text>
          </View>
        </Pressable>
      </ThemePicker>
      <Text style={settingStyles.heading}>Theme</Text>
      {[
        { text: "Dark", icon: "dark_mode" },
        { text: "Light", icon: "light_mode" },
        { text: "System", icon: "computer" },
      ]
        .map((e) => ({
          ...e,
          selected: e.text.toLowerCase() === session?.user?.profile?.darkMode,
          callback: () => {
            try {
              sendApiRequest(
                sessionToken,
                "PUT",
                "user/profile",
                {},
                {
                  body: JSON.stringify({
                    darkMode: e.text.toLowerCase(),
                  }),
                }
              );
              mutate(
                (oldData) => ({
                  ...oldData,
                  user: {
                    ...oldData.user,
                    profile: {
                      ...oldData.user.profile,
                      darkMode: e.text.toLowerCase(),
                    },
                  },
                }),
                {
                  revalidate: false,
                }
              );
            } catch (e) {
              Toast.show({ type: "error" });
              mutate(() => session, {
                revalidate: false,
              });
            }
          },
        }))
        .map((e) => (
          <ListItemButton
            key={e.text}
            onPress={e.callback}
            variant="outlined"
            style={{ marginBottom: 7 }}
          >
            <Icon>{e.icon}</Icon>
            <ListItemText primary={e.text} />
            <Icon filled={e.selected}>
              {e.selected ? "check_circle" : "radio_button_unchecked"}
            </Icon>
          </ListItemButton>
        ))}
    </SettingsScrollView>
  );
}
