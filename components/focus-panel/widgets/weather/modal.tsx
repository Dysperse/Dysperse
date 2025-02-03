import { useUser } from "@/context/useUser";
import { addHslAlpha, useColor } from "@/ui/color";
import { ColorThemeProvider } from "@/ui/color/theme-provider";
import Icon from "@/ui/Icon";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { FlatList, ScrollView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import { Navbar } from "../../panel";
import airQuality from "./airQuality.json";
import weatherCodes from "./weatherCodes.json";

const getAirQualityInfo = (index) => {
  const result = airQuality.find(
    (category) => index >= category.index.min && index <= category.index.max
  );

  return result || null; // Return null if no matching category is found
};

const weatherStyles = StyleSheet.create({
  cardRow: { marginTop: 15, gap: 15, flexDirection: "row" },
  description: {
    marginBottom: 40,
    opacity: 0.9,
    fontSize: 20,
    marginTop: -7,
    textAlign: "center",
  },
  temperature: {
    marginRight: -22,
    fontSize: 60,
    textAlign: "center",
    marginTop: 10,
    marginLeft: -10,
  },
  weatherCard: {
    flex: 1,
    gap: 15,
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 20,
  },
});

function WeatherModal({
  weather,
  // location,
  airQuality,
  isNight,
}: any) {
  const weatherDescription =
    weatherCodes[weather.current_weather.weathercode][
      isNight ? "night" : "day"
    ];
  const theme = useColor(weatherDescription.colorTheme);
  const color = useMemo(() => theme[11], [theme]);
  const hour = useMemo(() => dayjs().hour(), []);
  const base = addHslAlpha(theme[11], 0.1);

  const WeatherCard = ({
    icon,
    heading,
    subheading,
    onPress = () => {},
  }: any) => (
    <Pressable
      onPress={onPress}
      style={[weatherStyles.weatherCard, { backgroundColor: base }]}
    >
      <Icon style={{ color }}>{icon}</Icon>
      <View style={{ minWidth: 0, flex: 1 }}>
        <Text
          variant="eyebrow"
          numberOfLines={1}
          style={{ color, marginBottom: 3, fontSize: 13 }}
        >
          {heading}
        </Text>
        <Text style={{ color }}>{subheading}</Text>
      </View>
    </Pressable>
  );

  return (
    <>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View
          style={{ paddingHorizontal: 15, paddingVertical: 20, paddingTop: 10 }}
        >
          <View style={{ alignItems: "center" }}>
            <Icon size={70} style={{ color, marginTop: 40 }}>
              {
                weatherCodes[weather.current_weather.weathercode][
                  isNight ? "night" : "day"
                ].icon
              }
            </Icon>
          </View>
          <Text
            style={[
              weatherStyles.temperature,
              { color, fontFamily: "serifText700", marginBottom: 10 },
            ]}
          >
            {Math.round(weather.current_weather.temperature)}&deg;
          </Text>
          <Text style={[weatherStyles.description, { color }]} weight={500}>
            {weatherDescription.description}
          </Text>
          <View style={weatherStyles.cardRow}>
            <WeatherCard
              icon="waving_hand"
              heading="Feels like"
              subheading={`${~~weather.hourly.apparent_temperature[hour]}°`}
            />
            <WeatherCard
              icon="water_drop"
              heading="Precipitation"
              subheading={`${Math.round(
                weather.hourly.precipitation_probability[hour]
              )}%`}
            />
          </View>
          <View style={{ marginTop: 15, gap: 15, flexDirection: "row" }}>
            <WeatherCard
              icon="airwave"
              heading="Wind"
              subheading={`${~~weather.hourly.wind_speed_10m[hour]} mph`}
            />
            <WeatherCard
              icon="visibility"
              heading="Visibility"
              subheading={`${~~(weather.hourly.visibility[hour] / 1609)} mi`}
            />
          </View>
          <View style={weatherStyles.cardRow}>
            <WeatherCard
              icon="north"
              heading="High"
              subheading={`${-~weather.daily.temperature_2m_max[0]}°`}
            />
            <WeatherCard
              icon="south"
              heading="Low"
              subheading={`${-~weather.daily.temperature_2m_min[0]}°`}
            />
          </View>
          <View style={weatherStyles.cardRow}>
            <WeatherCard
              icon="wb_sunny"
              heading="Sunset"
              subheading={dayjs(weather.daily.sunrise[0]).format("h:mm A")}
            />
            <WeatherCard
              icon="wb_twilight"
              heading="Sunrise"
              subheading={dayjs(weather.daily.sunset[0]).format("h:mm A")}
            />
          </View>
          <View style={{ marginTop: 15 }} />
          <WeatherCard
            icon="eco"
            heading="Air Quality"
            onPress={() =>
              alert(getAirQualityInfo(airQuality.current.pm2_5)?.meaning || "")
            }
            subheading={`${
              getAirQualityInfo(airQuality?.current?.pm2_5)?.category
            } — ${airQuality.current.pm2_5} ${airQuality.current_units.pm2_5}`}
          />
        </View>
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={{ color }} variant="eyebrow">
            Hourly
          </Text>
        </View>
        <FlatList
          data={weather.hourly.temperature_2m.slice(0, 24)}
          horizontal
          contentContainerStyle={{
            gap: 15,
            paddingHorizontal: 20,
          }}
          style={{ marginBottom: 20, marginTop: 10 }}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View
              key={index}
              {...(index === hour && { id: "activeHour" })}
              style={{
                backgroundColor: base,
                paddingHorizontal: 25,
                paddingVertical: 15,
                flexShrink: 0,
                borderRadius: 20,
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Icon style={{ color, marginBottom: 7 }} size={30}>
                {
                  weatherCodes[weather.hourly.weathercode[index]][
                    isNight ? "night" : "day"
                  ].icon
                }
              </Icon>
              <Text style={{ color, marginRight: -3 }} weight={600}>
                {-~item}&deg;
              </Text>
              <Text
                style={{
                  color,
                  opacity: 0.6,
                  textTransform: "uppercase",
                }}
              >
                {dayjs().startOf("day").add(index, "hours").format("hA")}
              </Text>
            </View>
          )}
        />
      </ScrollView>
    </>
  );
}

export function FocusPanelWeather({ navigation }) {
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

  const { data: airQualityData } = useSWR(
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

  const isNight = useCallback(() => {
    console.log(data);
    if (data?.current_weather) return !data.current_weather.is_day;
  }, [data]);
  const { session } = useUser();

  const theme = useColor(
    data
      ? weatherCodes[data.current_weather.weathercode][
          isNight ? "night" : "day"
        ].colorTheme
      : session.user.profile.theme
  );

  return (
    <ColorThemeProvider theme={theme}>
      <Navbar
        title="Weather"
        navigation={navigation}
        backgroundColor={theme[3]}
        foregroundColor={theme[11]}
      />
      <LinearGradient colors={[theme[3], theme[5]]} style={{ flex: 1 }}>
        {data && airQualityData ? (
          <WeatherModal
            weather={data}
            location={null}
            airQuality={airQualityData}
            isNight={isNight()}
          />
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Spinner />
          </View>
        )}
      </LinearGradient>
    </ColorThemeProvider>
  );
}
