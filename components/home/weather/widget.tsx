import { useFocusPanelWidgetContext } from "@/components/focus-panel/context";
import { widgetStyles } from "@/components/focus-panel/widgetStyles";
import weatherCodes from "@/components/home/weather/weatherCodes.json";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import { WeatherModal } from "./modal";

export function WeatherWidget() {
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
  }, []);

  const {
    data,
    isLoading: isWeatherLoading,
    error,
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
      : null
  );

  const { data: airQualityData, isLoading: isAirQualityLoading } = useSWR(
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
      : null
  );

  const isLoading = isWeatherLoading || isAirQualityLoading;

  const isNight = () => {
    const currentHour = new Date().getHours();
    return currentHour >= 18 || currentHour <= 6; // Assuming night is between 6 PM and 6 AM
  };

  const onPressHandler = async () => {
    if (!location) {
      await requestLocationPermission();
    }
  };

  const theme = useColorTheme();

  const weatherCardStyles = useMemo(
    () =>
      ({ pressed, hovered }: any) =>
        [
          widgetStyles.card,
          {
            backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
          },
        ],
    [theme]
  );

  const weatherDescription = useMemo(
    () =>
      data
        ? weatherCodes[data.current_weather.weathercode][
            isNight() ? "night" : "day"
          ]
        : {},
    [data]
  );

  const gradient = useMemo(
    () => weatherDescription.backgroundGradient?.reverse(),
    [weatherDescription]
  );

  const { setWidgets } = useFocusPanelWidgetContext();

  return (
    <View style={widgetStyles.widget}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text variant="eyebrow">Weather</Text>
        <IconButton
          icon="remove"
          size={25}
          style={{ opacity: 0.3, marginRight: 5 }}
          onPress={() =>
            setWidgets((widgets) => widgets.filter((w) => w !== "weather"))
          }
        />
      </View>
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
          <Spinner />
        </Pressable>
      ) : data && airQualityData ? (
        <WeatherModal
          weather={data}
          location={null}
          airQuality={airQualityData}
          isNight={isNight()}
        >
          <Pressable>
            <LinearGradient
              colors={gradient}
              style={[
                widgetStyles.card,
                {
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                },
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 40,
                    color: weatherDescription.textColor,
                  }}
                  weight={600}
                >
                  {Math.round(data.hourly.apparent_temperature[dayjs().hour()])}
                  &deg;
                </Text>
                <Text
                  weight={200}
                  numberOfLines={1}
                  style={{ color: weatherDescription.textColor, marginTop: -5 }}
                >
                  {isNight()
                    ? weatherCodes[data.current_weather.weathercode].night
                        .description
                    : weatherCodes[data.current_weather.weathercode].day
                        .description}
                </Text>
              </View>
              <Icon
                size={40}
                style={{ color: weatherDescription.textColor, marginRight: 10 }}
              >
                {
                  weatherCodes[data.current_weather.weathercode][
                    isNight() ? "night" : "day"
                  ].icon
                }
              </Icon>
            </LinearGradient>
          </Pressable>
        </WeatherModal>
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
