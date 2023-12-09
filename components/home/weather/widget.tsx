import weatherCodes from "@/components/home/weather/weatherCodes.json";
import Icon from "@/ui/Icon";
import dayjs from "dayjs";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable } from "react-native";
import Text from "@/ui/Text";
import { WeatherModal } from "./modal";

export function WeatherWidget() {
  const [location, setLocation] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [airQualityData, setAirQualityData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkLocationPermission = async () => {
    let { status } = await Location.getForegroundPermissionsAsync();
    if (status === "granted") {
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    }
  };

  const requestLocationPermission = async () => {
    setLoading(false);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    } else {
      setError(true);
    }
  };

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const getWeather = async () => {
    let lat = location.coords.latitude;
    let long = location.coords.longitude;
    fetch(`https://geocode.maps.co/reverse?lat=${lat}&lon=${long}`)
      .then((res) => res.json())
      .then((res) => setLocationData(res));
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
        setWeatherData(res);
        const url = getUrl(10);
        fetch(url)
          .then((res) => res.json())
          .then((res) => setWeatherData(res))
          .catch((res) => setError(true));
      })
      .catch((res) => setError(true));

    setLoading(false);
  };

  useEffect(() => {
    if (location && !locationData && !weatherData && !error) {
      getWeather();
    }
  }, [location, locationData, error]);

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

  return loading || (location && !locationData) ? (
    <Pressable
      style={({ pressed }) => ({
        backgroundColor: pressed ? "lightgray" : "white",
      })}
      onPress={onPressHandler}
      className="h-36 rounded-3xl bg-gray-200 flex-1 justify-center p-5 active:bg-gray-300"
    >
      <ActivityIndicator />
    </Pressable>
  ) : weatherData && locationData && airQualityData ? (
    <WeatherModal
      weather={weatherData}
      location={locationData}
      airQuality={airQualityData}
      isNight={isNight()}
    >
      <Pressable
        style={({ pressed }) => ({
          backgroundColor: pressed ? "lightgray" : "white",
        })}
        className="h-36 rounded-3xl bg-gray-200 flex-1 justify-end p-5 active:bg-gray-300"
      >
        <Icon size={40} style={{ marginLeft: -5 }}>
          {
            weatherCodes[weatherData.current_weather.weathercode][
              isNight() ? "night" : "day"
            ].icon
          }
        </Icon>
        <Text textClassName="text-xl mt-1" style={{ fontFamily: "body_700" }}>
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
      style={({ pressed }) => ({
        backgroundColor: pressed ? "lightgray" : "white",
      })}
      onPress={onPressHandler}
      className="h-36 rounded-3xl bg-gray-200 flex-1 justify-end p-5 active:bg-gray-300"
    >
      <Text>Tap to enable location</Text>
    </Pressable>
  );
}
