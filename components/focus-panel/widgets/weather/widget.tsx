import { Avatar } from "@/ui/Avatar";
import { Button } from "@/ui/Button";
import Icon from "@/ui/Icon";
import MenuPopover from "@/ui/MenuPopover";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import * as Location from "expo-location";
import { useCallback, useEffect, useMemo, useState } from "react";
import { InteractionManager, Pressable, View } from "react-native";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import { useFocusPanelContext } from "../../context";
import weatherCodes from "./weatherCodes.json";

export default function WeatherWidget({
  small,
  widget,
  handlePin,
}: {
  small;
  widget: any;
  handlePin: any;
}) {
  const { drawerRef } = useFocusPanelContext();
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
  }, [checkLocationPermission]);

  const {
    data,
    isLoading: isWeatherLoading,
    error,
  } = useSWR(
    location
      ? [
          "",
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

  const { data: airQualityData, isLoading: isAirQualityLoading } = useSWR(
    location
      ? [
          "",
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

  const weatherDescription = useMemo(
    () =>
      data
        ? weatherCodes[data.current_weather.weathercode][
            isNight() ? "night" : "day"
          ]
        : {},
    [data, isNight]
  );

  const showSunrise = useMemo(() => {
    const sunrise = dayjs(data?.daily.sunrise[0]);
    const sunset = dayjs(data?.daily.sunset[0]);
    const current = dayjs();
    return current.isBefore(sunrise) || current.isAfter(sunset);
  }, [data]);

  return small ? (
    <View
      style={{
        alignItems: "center",
        flexDirection: "row",
        gap: 10,
        flex: 1,
      }}
    >
      {data ? (
        <>
          <Icon bold size={18}>
            {
              weatherCodes[data.current_weather.weathercode][
                isNight() ? "night" : "day"
              ].icon
            }
          </Icon>
          <Text
            style={{ color: theme[11], flex: 1, fontSize: 14, height: "100%" }}
            weight={700}
            numberOfLines={1}
          >
            {weatherDescription?.description}
          </Text>
          <Text
            style={{
              marginLeft: "auto",
              color: theme[11],
              opacity: 0.7,
              fontSize: 14,
            }}
            weight={700}
          >
            {Math.round(data.current_weather.temperature)}&deg;
          </Text>
        </>
      ) : error || permissionStatus === "denied" ? (
        <Text style={{ color: theme[11], fontSize: 12 }} weight={600}>
          An error occured
        </Text>
      ) : (!location || isLoading) && permissionStatus !== "undetermined" ? (
        <Spinner style={{ marginHorizontal: "auto" }} />
      ) : (
        <Text
          style={{
            color: theme[11],
            opacity: 0.6,
            fontSize: 13,
            marginHorizontal: "auto",
            textAlign: "center",
          }}
          weight={600}
        >
          Tap & hold to enable weather
        </Text>
      )}
    </View>
  ) : (
    <Pressable onPress={onPressHandler}>
      <MenuPopover
        menuProps={{
          rendererProps: { placement: "bottom" },
          style: { marginRight: "auto", marginLeft: -10 },
        }}
        containerStyle={{ marginLeft: 20, marginTop: -10 }}
        options={[
          {
            text: widget.pinned ? "Pinned" : "Pin",
            icon: "push_pin",
            callback: handlePin,
            selected: widget.pinned,
          },
        ]}
        trigger={
          <Button
            dense
            textProps={{ variant: "eyebrow" }}
            text="Weather"
            icon="expand_more"
            iconPosition="end"
            containerStyle={{ marginBottom: 5 }}
            iconStyle={{ opacity: 0.6 }}
          />
        }
      />
      {error || permissionStatus === "denied" ? (
        <>
          <Icon size={40} style={{ marginLeft: -2 }}>
            error
          </Icon>
          <Text style={{ fontSize: 20, marginVertical: 5 }} weight={700}>
            Error
          </Text>
          <Text>Tap to retry</Text>
        </>
      ) : (!location || isLoading) && permissionStatus !== "undetermined" ? (
        <View
          style={{
            alignItems: "center",
            paddingVertical: 80,
            backgroundColor: theme[2],
            padding: 20,
            borderColor: theme[5],
            borderRadius: 20,
            borderWidth: 1,
          }}
        >
          <Spinner />
        </View>
      ) : data && airQualityData ? (
        <Button
          height={205}
          disabled
          onPress={() => {
            drawerRef.current?.openDrawer();
            InteractionManager.runAfterInteractions(() => {
              drawerRef.current?.openDrawer();
            });
          }}
          style={{ flexDirection: "column", paddingVertical: 20 }}
          containerStyle={{ borderRadius: 20 }}
          variant="outlined"
          backgroundColors={{
            default: theme[2],
            pressed: theme[2],
            hovered: theme[2],
          }}
        >
          <View style={{ width: "100%" }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 5,
              }}
            >
              <View style={{ flex: 1, gap: 5 }}>
                <Text
                  style={{
                    fontSize: 30,
                    fontFamily: "serifText700",
                    color: theme[11],
                  }}
                >
                  {Math.round(data.current_weather.temperature)}&deg; F
                </Text>
                <View
                  style={{
                    gap: 5,
                    flexDirection: "row",
                  }}
                >
                  <Icon size={15} style={{ verticalAlign: "middle" }}>
                    {
                      weatherCodes[data.current_weather.weathercode][
                        isNight() ? "night" : "day"
                      ].icon
                    }
                  </Icon>
                  <Text
                    style={{
                      fontSize: 15,
                      color: theme[11],
                      opacity: 0.6,
                      fontFamily: "mono",
                    }}
                  >
                    {weatherDescription?.description} &bull; Feels like{" "}
                    {Math.round(
                      data.hourly.apparent_temperature[dayjs().hour()]
                    )}
                    &deg;
                  </Text>
                </View>
              </View>
            </View>
            <View>
              {/* High/low */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  marginTop: 10,
                }}
              >
                <View style={{ flexDirection: "row", gap: 10, flex: 1 }}>
                  <Avatar
                    icon={showSunrise ? "wb_sunny" : "wb_twilight"}
                    size={35}
                    style={{
                      borderRadius: 10,
                      backgroundColor: addHslAlpha(theme[9], 0.1),
                    }}
                  />
                  <View>
                    <Text
                      weight={700}
                      style={{ color: theme[11], marginTop: -2 }}
                    >
                      {dayjs(
                        data.daily[showSunrise ? "sunrise" : "sunset"][0]
                      ).format("h:mm")}
                    </Text>
                    <Text
                      style={{
                        marginTop: -2,
                        color: theme[11],
                        opacity: 0.6,
                        fontSize: 13,
                      }}
                    >
                      {showSunrise ? "Sunrise" : "Sunset"}
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    gap: 10,
                    flex: 1,
                  }}
                >
                  <Avatar
                    icon="water_drop"
                    size={35}
                    style={{
                      borderRadius: 10,
                      backgroundColor: addHslAlpha(theme[9], 0.1),
                    }}
                  />
                  <View>
                    <Text
                      weight={700}
                      style={{ color: theme[11], marginTop: -2 }}
                    >
                      {Math.round(
                        data.hourly.precipitation_probability[dayjs().hour()]
                      )}
                      %
                    </Text>
                    <Text
                      style={{
                        marginTop: -2,
                        color: theme[11],
                        opacity: 0.6,
                        fontSize: 13,
                      }}
                    >
                      Precipitation
                    </Text>
                  </View>
                </View>
              </View>
              <View style={{ flexDirection: "row", marginTop: 10 }}>
                <View style={{ flexDirection: "row", flex: 1, gap: 10 }}>
                  <Avatar
                    icon="south"
                    size={35}
                    style={{
                      borderRadius: 10,
                      backgroundColor: addHslAlpha(theme[9], 0.1),
                    }}
                  />
                  <View>
                    <Text
                      weight={700}
                      style={{ color: theme[11], marginTop: -2 }}
                    >
                      {Math.round(data.daily.temperature_2m_min[0])}&deg;
                    </Text>
                    <Text
                      style={{
                        marginTop: -2,
                        color: theme[11],
                        opacity: 0.6,
                        fontSize: 13,
                      }}
                    >
                      Low
                    </Text>
                  </View>
                </View>
                <View style={{ flexDirection: "row", flex: 1, gap: 10 }}>
                  <Avatar
                    icon="north"
                    size={35}
                    style={{
                      borderRadius: 10,
                      backgroundColor: addHslAlpha(theme[9], 0.1),
                    }}
                  />
                  <View>
                    <Text
                      weight={700}
                      style={{ color: theme[11], marginTop: -2 }}
                    >
                      {Math.round(data.daily.temperature_2m_max[0])}&deg;
                    </Text>
                    <Text
                      style={{
                        marginTop: -2,
                        color: theme[11],
                        opacity: 0.6,
                        fontSize: 13,
                      }}
                    >
                      High
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </Button>
      ) : (
        <View
          style={{
            backgroundColor: theme[2],
            padding: 20,
            borderColor: theme[5],
            borderRadius: 20,
            borderWidth: 1,
          }}
        >
          <Icon size={40} style={{ marginLeft: -2 }}>
            near_me
          </Icon>
          <Text style={{ fontSize: 20, marginVertical: 5 }} weight={700}>
            Weather
          </Text>
          <Text>Tap to enable</Text>
        </View>
      )}
    </Pressable>
  );
}
