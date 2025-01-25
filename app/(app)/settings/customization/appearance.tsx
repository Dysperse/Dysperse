import { settingStyles } from "@/components/settings/settingsStyles";
import themes from "@/components/themes.json";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import Icon from "@/ui/Icon";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import SettingsScrollView from "@/ui/SettingsScrollView";
import Text from "@/ui/Text";
import { ColorTheme, useColor, useDarkMode } from "@/ui/color";
import { ColorThemeProvider, useColorTheme } from "@/ui/color/theme-provider";
import { setAlternateAppIcon } from "expo-alternate-app-icons";
import { Image } from "expo-image";
import { View } from "react-native";
import Toast from "react-native-toast-message";

function ThemedSlide({
  theme,
  themeData,
}: {
  theme: ColorTheme;
  themeData: { name: string; description: string };
}) {
  const { sessionToken, mutate, session } = useUser();
  const breapoints = useResponsiveBreakpoints();
  const colors = useColor(theme);
  const isDark = useDarkMode();

  const handleSelect = async () => {
    try {
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
        width: breapoints.md ? "33.333%" : "50%",
      }}
    >
      <ColorThemeProvider theme={colors}>
        <Button
          onPress={handleSelect}
          height={210}
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
          style={{
            alignItems: "center",
            flexDirection: "column",
            paddingHorizontal: 10,
            borderRadius: 20,
            position: "relative",
          }}
          variant="outlined"
          containerStyle={{ borderRadius: 20, borderWidth: 2 }}
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
            style={{ width: 100, height: 100 }}
            source={{
              uri: `https://assets.dysperse.com/themes/${
                isDark ? "dark/" : ""
              }${theme}.svg?`,
            }}
          />
          <Text
            weight={600}
            style={{ fontSize: 20, textAlign: "center", marginBottom: -10 }}
          >
            {themeData.name}
          </Text>
        </Button>
      </ColorThemeProvider>
    </View>
  );
}

function AppIconSection() {
  const { session, mutate } = useUser();

  return (
    <>
      <Text style={settingStyles.heading}>App icon</Text>
      <ListItemButton
        onPress={() => {
          setAlternateAppIcon("Testflight");
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
        variant="outlined"
        style={{ marginBottom: 7 }}
      >
        <ListItemText primary="Default" />
        <Icon filled={!session?.user?.profile?.theme}>check_circle</Icon>
      </ListItemButton>
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
      <AppIconSection />
    </SettingsScrollView>
  );
}

