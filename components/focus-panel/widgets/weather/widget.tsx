import { widgetStyles } from "@/components/focus-panel/widgetStyles";
import { useUser } from "@/context/useUser";
import Icon from "@/ui/Icon";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { ColorThemeProvider, useColorTheme } from "@/ui/color/theme-provider";
import { StackNavigationProp } from "@react-navigation/stack";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import { useFocusPanelContext } from "../../context";
import weatherCodes from "./weatherCodes.json";

const gridStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },
  avatar: {
    borderRadius: 10,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  textContainer: {
    flex: 1,
  },
  subtitle: {
    fontSize: 12,
    opacity: 0.7,
  },
});

export default function WeatherWidget({
  widget,
  navigation,
  menuActions,
}: {
  widget: any;
  navigation: StackNavigationProp<any>;
  menuActions: any[];
}) {
  const { setPanelState, collapseOnBack } = useFocusPanelContext();
  const [location, setLocation] = useState(null);
  const [permissionStatus, setPermissionStatus] =
    useState<Location.PermissionStatus>(null);

  const checkLocationPermission = useCallback(async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    setPermissionStatus(status);
    if (status === "granted") {
      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    }
  }, []);

  const { panelState } = useFocusPanelContext();

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {
      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    } else {
      Toast.show({
        type: "error",
        text1: "Something went wrong",
      });
    }
  };

  useEffect(() => {
    checkLocationPermission();
  }, [checkLocationPermission]);

  const {
    data,
    isLoading: isWeatherLoading,
    error,
    mutate: mutateWeather,
  } = useSWR(
    location
      ? [
          ``,
          {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            current: "relative_humidity_2m",
            hourly:
              "visibility,temperature_2m,wind_speed_10m,apparent_temperature,precipitation_probability,weathercode",
            current_weather: true,
            temperature_unit: "fahrenheit",
            windspeed_unit: "mph",
            precipitation_unit: "inch",
            timezone: "auto",
            forecast_days: 3,
            daily:
              "sunrise,sunset,weather_code,temperature_2m_max,temperature_2m_min",
          },
          "https://api.open-meteo.com/v1/forecast",
        ]
      : null,
    {
      refreshInterval: 2 * 60 * 1000,
    }
  );

  const {
    data: airQualityData,
    isLoading: isAirQualityLoading,
    mutate: mutateAirQuality,
  } = useSWR(
    location
      ? [
          ``,
          {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            current: "pm2_5",
          },
          "https://air-quality-api.open-meteo.com/v1/air-quality",
        ]
      : null,
    {
      refreshInterval: 2 * 60 * 1000,
    }
  );

  const isLoading = isWeatherLoading || isAirQualityLoading;

  const isNight = useCallback(() => {
    if (data?.current_weather) return !data.current_weather.is_day;
    const currentHour = new Date().getHours();
    return currentHour >= 18 || currentHour <= 6; // Assuming night is between 6 PM and 6 AM
  }, [data]);

  const onPressHandler = async () => {
    if (!location) {
      await requestLocationPermission();
    }
  };

  const theme = useColorTheme();

  const weatherCardStyles = ({ pressed, hovered }) => [
    widgetStyles.card,
    {
      backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
      borderColor: theme[5],
    },
  ];

  const weatherDescription = useMemo(
    () =>
      data
        ? weatherCodes[data.current_weather.weathercode][
            isNight() ? "night" : "day"
          ]
        : {},
    [data, isNight]
  );

  const { session } = useUser();
  const weatherColor = useColor(
    weatherDescription?.colorTheme || session.user.profile.theme
  );

  return (
    <View>
      {error || permissionStatus === "denied" ? (
        <Pressable style={weatherCardStyles} onPress={onPressHandler}>
          <Icon size={40} style={{ marginLeft: -2 }}>
            error
          </Icon>
          <Text style={{ fontSize: 20, marginVertical: 5 }} weight={700}>
            Error
          </Text>
          <Text>Tap to retry</Text>
        </Pressable>
      ) : (!location || isLoading) && permissionStatus !== "undetermined" ? (
        <Pressable style={weatherCardStyles} onPress={onPressHandler}>
          <View style={{ alignItems: "center", paddingVertical: 80 }}>
            <Spinner />
          </View>
        </Pressable>
      ) : data && airQualityData ? (
        <ColorThemeProvider theme={weatherColor}>
          <Pressable
            onPress={() => {
              navigation.push("Weather");
              setPanelState("OPEN");
              if (panelState === "COLLAPSED") collapseOnBack.current = true;
            }}
          >
            {({ pressed, hovered }) => (
              <LinearGradient
                colors={[
                  weatherColor[pressed ? 6 : hovered ? 5 : 3],
                  weatherColor[pressed ? 5 : hovered ? 4 : 3],
                ]}
                style={[
                  widgetStyles.card,
                  {
                    borderColor: weatherColor[6],
                  },
                  panelState === "COLLAPSED" && { padding: 13 },
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View
                  style={{
                    flexDirection: "column",
                    alignItems:
                      panelState === "COLLAPSED" ? "center" : "flex-start",
                    justifyContent: "space-between",
                  }}
                >
                  <View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <Icon bold>
                        {
                          weatherCodes[data.current_weather.weathercode][
                            isNight() ? "night" : "day"
                          ].icon
                        }
                      </Icon>
                      <Text
                        style={{
                          fontSize: 22,
                          color: weatherColor[11],
                          textAlign: "center",
                        }}
                        weight={600}
                      >
                        {Math.round(data.current_weather.temperature)}&deg;
                        {panelState === "COLLAPSED" ? "" : "F"}
                      </Text>
                    </View>
                    <Text
                      style={{
                        opacity: 0.8,
                        color: weatherColor[11],
                        textAlign: "center",
                      }}
                      weight={300}
                    >
                      {
                        weatherCodes[data.current_weather.weathercode][
                          isNight() ? "night" : "day"
                        ].description
                      }
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            )}
          </Pressable>
        </ColorThemeProvider>
      ) : (
        <Pressable style={weatherCardStyles} onPress={onPressHandler}>
          <Icon size={40} style={{ marginLeft: -2 }}>
            near_me
          </Icon>
          <Text style={{ fontSize: 20, marginVertical: 5 }} weight={700}>
            Weather
          </Text>
          <Text>Tap to enable</Text>
        </Pressable>
      )}
    </View>
  );
}
