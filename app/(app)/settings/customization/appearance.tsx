import { SettingsLayout } from "@/components/settings/layout";
import { settingStyles } from "@/components/settings/settingsStyles";
import themes from "@/components/themes.json";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import BottomSheet from "@/ui/BottomSheet";
import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import MenuPopover from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { ColorThemeProvider, useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { cloneElement, useCallback, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import Swiper from "react-native-web-swiper";

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: 20,
  },
  button: { height: 80 },
  themeCardIcon: { textAlign: "center" },
  cardTitle: { fontSize: 25 },
  cardDescription: { opacity: 0.7, maxWidth: 300 },
});

const themePickerStyles = StyleSheet.create({
  title: { textAlign: "center", fontSize: 50 },
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

function ThemedSlide({ theme, themeData, onSelect }) {
  const colors = useColor(theme as any, useColorScheme() === "dark");
  return (
    <ColorThemeProvider theme={colors}>
      <Pressable onPress={onSelect}>
        <Icon size={300} filled>
          hexagon
        </Icon>
      </Pressable>
      <Text heading style={themePickerStyles.title}>
        {themeData.name}
      </Text>
      <Text style={themePickerStyles.description}>{themeData.description}</Text>
    </ColorThemeProvider>
  );
}
function ThemePicker({ children }) {
  const ref = useRef<BottomSheetModal>(null);
  const { session, sessionToken, mutate } = useUser();
  const [selectedTheme, setSelectedTheme] = useState(
    session.user.profile.theme
  );
  const colors = useColor(selectedTheme as any, useColorScheme() === "dark");

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
      setTimeout(handleClose, 100);
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
  const dark = useColorScheme() === "dark";

  return (
    <>
      {trigger}
      <BottomSheet
        sheetRef={ref}
        disableBackToClose
        disableBackdropPressToClose
        disableEscapeToClose
        enablePanDownToClose={false}
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
          <Text variant="eyebrow" style={{ color: theme.colors[11] }}>
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
            onAnimationEnd={(e) => {
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
                dotProps: { Component: (() => null) as any },
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
            {Object.keys(themes).map((theme) => (
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
              style={[
                themePickerStyles.button,
                { backgroundColor: theme.colors[3] },
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
  const { session, mutate, sessionToken } = useUser();
  const themeText = themes[session?.user?.profile?.theme || "mint"];
  return (
    <SettingsLayout>
      <Text heading style={{ fontSize: 50 }}>
        Appearance
      </Text>

      <Text style={settingStyles.heading}>Color</Text>
      <ThemePicker>
        <TouchableOpacity>
          <Pressable
            style={[
              styles.card,
              {
                borderColor: theme[5],
                alignItems: "center",
                flexDirection: "row",
                gap: 20,
              },
            ]}
          >
            <Icon style={styles.themeCardIcon} size={100}>
              hexagon
            </Icon>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle} weight={900}>
                {themeText.name}
              </Text>
              <Text style={styles.cardDescription}>
                {themeText.description}
              </Text>
            </View>
          </Pressable>
        </TouchableOpacity>
      </ThemePicker>
      <Text style={settingStyles.heading}>Theme</Text>
      <MenuPopover
        trigger={
          <TouchableOpacity>
            <View
              style={[
                styles.card,
                {
                  borderColor: theme[5],
                  flexDirection: "row",
                  gap: 20,
                  alignItems: "center",
                  justifyContent: "space-between",
                },
              ]}
            >
              <Icon size={30}>
                {
                  {
                    dark: "dark_mode",
                    light: "light_mode",
                    system: "computer",
                  }[session?.user?.profile?.darkMode]
                }
              </Icon>
              <Text style={styles.cardTitle} weight={900}>
                {capitalizeFirstLetter(session?.user?.profile?.darkMode)}
              </Text>
              <Icon style={{ marginLeft: -10 }} size={30}>
                expand_all
              </Icon>
            </View>
          </TouchableOpacity>
        }
        options={[
          { text: "Dark", icon: "dark_mode", callback: () => {} },
          { text: "Light", icon: "light_mode", callback: () => {} },
          { text: "System", icon: "computer", callback: () => {} },
        ].map((e) => ({
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
              mutate((oldData) => ({
                ...oldData,
                user: {
                  ...oldData.user,
                  profile: {
                    ...oldData.user.profile,
                    darkMode: e.text.toLowerCase(),
                  },
                },
              }));
            } catch (e) {
              Toast.show({ type: "error" });
              mutate(() => session);
            }
          },
        }))}
      />
    </SettingsLayout>
  );
}
