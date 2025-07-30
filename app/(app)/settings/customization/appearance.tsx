import { settingStyles } from "@/components/settings/settingsStyles";
import themes from "@/components/themes.json";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import SettingsScrollView from "@/ui/SettingsScrollView";
import Text from "@/ui/Text";
import { ColorTheme, useColor, useDarkMode } from "@/ui/color";
import { ColorThemeProvider, useColorTheme } from "@/ui/color/theme-provider";
import { setAlternateAppIcon } from "expo-alternate-app-icons";
import { Image } from "expo-image";
import { Platform, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

function ThemedSlide({
  theme,
  themeData,
}: {
  theme: ColorTheme;
  themeData: { name: string; description: string };
}) {
  const { sessionToken, mutate, session } = useUser();
  const breakpoints = useResponsiveBreakpoints();
  const colors = useColor(theme);
  const isDark = useDarkMode();

  const handleSelect = async () => {
    try {
      if (Platform.OS !== "web")
        setAlternateAppIcon(`${theme}${isDark ? "Dark" : "Light"}`);
      sendApiRequest(
        sessionToken,
        "PUT",
        "user/profile",
        {},
        {
          body: JSON.stringify({ color: theme }),
        }
      );
      mutate(
        (oldData) => ({
          ...oldData,
          user: {
            ...oldData.user,
            profile: { ...oldData.user.profile, theme },
          },
        }),
        {
          revalidate: false,
        }
      );
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Something went wrong. Please try again later",
      });
    }
  };

  const isSelected = theme === session?.user?.profile?.theme;

  return (
    <View
      style={{
        padding: 5,
        width: breakpoints.lg ? "33.333%" : breakpoints.md ? "50%" : "100%",
      }}
    >
      <ColorThemeProvider theme={colors}>
        <Button
          onPress={handleSelect}
          height={100}
          backgroundColors={{
            default: colors[4],
            hovered: colors[5],
            pressed: colors[6],
          }}
          borderColors={{
            default: colors[isSelected ? 11 : 4],
            hovered: colors[isSelected ? 10 : 5],
            pressed: colors[isSelected ? 9 : 6],
          }}
          variant="outlined"
          containerStyle={{
            borderWidth: 2,
            position: "relative",
            borderRadius: 25,
          }}
          style={{
            gap: 15,
            paddingHorizontal: 25,
            justifyContent: "flex-start",
          }}
        >
          {isSelected && (
            <View
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                backgroundColor: colors[11],
                borderRadius: 50,
                padding: 5,
              }}
            >
              <Icon style={{ color: colors[3] }}>check</Icon>
            </View>
          )}
          <Image
            style={{ width: 50, height: 50 }}
            source={{
              uri: `https://assets.dysperse.com/themes/${
                isDark ? "dark/" : ""
              }${theme}.svg?`,
            }}
          />
          <View style={{ flex: 1 }}>
            <Text weight={600} style={{ fontSize: 20, color: colors[11] }}>
              {themeData.name}
            </Text>
          </View>
        </Button>
      </ColorThemeProvider>
    </View>
  );
}

function AppIconSection() {
  return (
    <>
      <Text style={settingStyles.heading}>App icon</Text>
      <View
        style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: -5 }}
      >
        {[
          ...Object.keys(themes).map((t) => `${t}Light`),
          ...Object.keys(themes).map((t) => `${t}Dark`),
          "testflight",
        ].map((theme) => {
          return (
            <TouchableOpacity
              key={theme}
              onPress={() => setAlternateAppIcon(theme)}
              style={{
                padding: 5,
                width: `${100 / 7}%`,
              }}
            >
              <Image
                style={{ width: "100%", aspectRatio: 1, borderRadius: 10 }}
                source={{
                  uri: `https://assets.dysperse.com/icons/${theme}.png`,
                }}
              />
            </TouchableOpacity>
          );
        })}
      </View>
      {/* <ListItemButton
        onPress={() => {
          setAlternateAppIcon(null);
          mutate(
            (oldData) => ({
              ...oldData,
              user: {
                ...oldData.user,
                profile: { ...oldData.user.profile, theme: null },
              },
            }),
            {
              revalidate: false,
            }
          );
        }}
        variant="filled"
        style={{ marginTop: 10 }}
      >
        <ListItemText primary="Reset icon" />
      </ListItemButton> */}
    </>
  );
}

export default function Page() {
  const theme = useColorTheme();
  const { session, mutate, sessionToken } = useUser();

  return (
    <SettingsScrollView>
      <Text style={settingStyles.title}>Appearance</Text>
      <Text style={settingStyles.heading}>Theme</Text>
      <View style={{ flexDirection: "row", gap: 10 }}>
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
            <Button
              key={e.text}
              onPress={e.callback}
              variant="filled"
              containerStyle={{ flex: 1, borderRadius: 30 }}
              height={140}
              style={{
                paddingVertical: 20,
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Icon size={35}>{e.icon}</Icon>
              <ButtonText>{e.text}</ButtonText>
              <Icon filled={e.selected}>
                {e.selected ? "check_circle" : "radio_button_unchecked"}
              </Icon>
            </Button>
          ))}
      </View>

      <Text style={settingStyles.heading}>Color</Text>
      <View
        key={theme}
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
        }}
      >
        {Object.keys(themes).map((theme: ColorTheme) => (
          <ThemedSlide key={theme} theme={theme} themeData={themes[theme]} />
        ))}
      </View>
      {Platform.OS === "ios" && <AppIconSection />}
    </SettingsScrollView>
  );
}

