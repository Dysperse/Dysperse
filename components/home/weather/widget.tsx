import weatherCodes from "@/components/home/weather/weatherCodes.json";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable } from "react-native";
import { WeatherModal } from "./modal";
import { styles } from "../styles";

export function WeatherWidget() {
  const [location, setLocation] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [airQualityData, setAirQualityData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkLocationPermission = async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status === "granted") {
      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    }
  };

  const requestLocationPermission = async () => {
    setLoading(false);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {
      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    } else {
      setError(true);
    }
  };

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const getWeather = async (location) => {
    const lat = location.coords.latitude;
    const long = location.coords.longitude;

    // fetch(`https://geocode.maps.co/reverse?lat=${lat}&lon=${long}`)
    //   .then((res) => res.json())
    //   .then((res) => setLocationData(res));
    fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${long}&current=pm2_5`
    )
      .then((r) => r.json())
      .then((r) => setAirQualityData(r))
      .catch((res) => setError(true));

    const getUrl = (days) =>
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current=relative_humidity_2m&hourly=visibility,temperature_2m,wind_speed_10m,apparent_temperature,precipitation_probability,weathercode&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timezone=auto&forecast_days=${days}&daily=sunrise,sunset,weather_code,temperature_2m_max,temperature_2m_min`;
    const url = getUrl(1);

    fetch(url)
      .then((res) => res.json())
      .then((res) => {
        if (res.error) setError(true);
        setWeatherData(res);
        const url = getUrl(10);
        fetch(url)
          .then((res) => res.json())
          .then((res) => setWeatherData(res))
          .catch(() => setError(true));
      })
      .catch(() => setError(true));

    setLoading(false);
  };

  useEffect(() => {
    if (location) {
      getWeather(location);
    }
  }, [location]);

  const isNight = () => {
    const currentHour = new Date().getHours();
    return currentHour >= 18 || currentHour <= 6; // Assuming night is between 6 PM and 6 AM
  };

  const onPressHandler = async () => {
    if (!location) {
      await requestLocationPermission();
    } else if (locationData && weatherData) {
      alert(JSON.stringify(weatherData, null, 2));
    }
  };

  const theme = useColorTheme();
  return loading || (location && !weatherData) ? (
    <Pressable
      style={({ pressed, hovered }: any) => [
        styles.card,
        {
          backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
        },
      ]}
      onPress={onPressHandler}
    >
      <ActivityIndicator style={{ marginVertical: "auto" }} />
    </Pressable>
  ) : error ? (
    <Pressable
      style={({ pressed, hovered }: any) => [
        styles.card,
        {
          backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
        },
      ]}
      onPress={onPressHandler}
    >
      <Icon size={30} style={{ marginLeft: -2 }}>
        error
      </Icon>
      <Text style={{ fontSize: 20, marginVertical: 5 }} weight={700}>
        Yikes!
      </Text>
      <Text>Couldn't get weather</Text>
    </Pressable>
  ) : weatherData && airQualityData ? (
    <WeatherModal
      weather={weatherData}
      location={null}
      airQuality={airQualityData}
      isNight={isNight()}
    >
      <Pressable
        style={({ pressed, hovered }: any) => [
          styles.card,
          {
            backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
          },
        ]}
      >
        <Icon size={30} style={{ marginLeft: -2 }}>
          {
            weatherCodes[weatherData.current_weather.weathercode][
              isNight() ? "night" : "day"
            ].icon
          }
        </Icon>
        <Text style={{ fontSize: 20, marginVertical: 5 }} weight={700}>
          {Math.round(weatherData.hourly.apparent_temperature[dayjs().hour()])}
          &deg;
        </Text>
        <Text>
          {isNight()
            ? weatherCodes[weatherData.current_weather.weathercode].night
                .description
            : weatherCodes[weatherData.current_weather.weathercode].day
                .description}
        </Text>
      </Pressable>
    </WeatherModal>
  ) : (
    <Pressable
      style={({ pressed, hovered }: any) => [
        styles.card,
        {
          backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
        },
      ]}
      onPress={onPressHandler}
    >
      <Icon size={30} style={{ marginLeft: -2 }}>
        near_me
      </Icon>
      <Text style={{ fontSize: 20, marginVertical: 5 }} weight={700}>
        Weather
      </Text>
      <Text>Tap to enable location</Text>
    </Pressable>
  );
}
