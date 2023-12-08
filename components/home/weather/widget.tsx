import weatherCodes from "@/components/home/weather/weatherCodes.json";
import { BottomSheetBackHandler } from "@/ui/BottomSheet/BottomSheetBackHandler";
import { BottomSheetBackdropComponent } from "@/ui/BottomSheet/BottomSheetBackdropComponent";
import Icon from "@/ui/icon";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import dayjs from "dayjs";
import * as Location from "expo-location";
import { cloneElement, useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

function WeatherModal({ weather, location, children, isNight }) {
  const ref = useRef<BottomSheetModal>(null);

  // callbacks
  const handleOpen = useCallback(() => ref.current?.present(), []);
  const handleClose = useCallback(() => ref.current?.close(), []);
  const trigger = cloneElement(children, { onPress: handleOpen });

  return (
    <>
      {trigger}
      <BottomSheetModal
        ref={ref}
        snapPoints={["60%", "90%"]}
        backdropComponent={BottomSheetBackdropComponent}
      >
        <BottomSheetBackHandler handleClose={handleClose} />
        <BottomSheetScrollView>
          <View className="p-5 py-10">
            <View className="flex items-center">
              <Icon size={60}>
                {
                  weatherCodes[weather.current_weather.weathercode][
                    isNight ? "night" : "day"
                  ].icon
                }
              </Icon>
            </View>
            <Text
              className="text-5xl text-center mt-4"
              style={{ fontFamily: "body_700" }}
            >
              {Math.round(weather.current_weather.temperature)}&deg;
            </Text>
            <Text className="text-center">
              {location.address.city || location.address.county},{" "}
              {location.address.state}
            </Text>
            <Text className="mt-8">{JSON.stringify(weather, null, 2)}</Text>
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </>
  );
}

export function WeatherWidget() {
  const [location, setLocation] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
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
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&hourly=temperature_2m,apparent_temperature,weathercode&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timezone=auto&forecast_days=1`
    ).then((res) => res.json());
    setWeatherData(res);
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

  return location && !locationData ? (
    <Pressable
      style={({ pressed }) => ({
        backgroundColor: pressed ? "lightgray" : "white",
      })}
      onPress={onPressHandler}
      className="h-36 rounded-3xl bg-gray-200 flex-1 justify-end p-5 active:bg-gray-300"
    >
      <ActivityIndicator />
    </Pressable>
  ) : weatherData && locationData ? (
    <WeatherModal
      weather={weatherData}
      location={locationData}
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
        <Text className="text-xl mt-1" style={{ fontFamily: "body_700" }}>
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
