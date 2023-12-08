import weatherCodes from "@/components/weather/weatherCodes.json";
import { useSession } from "@/context/AuthProvider";
import { useUser } from "@/context/useUser";
import Icon from "@/ui/icon";
import dayjs from "dayjs";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StatusBar,
  Text,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";

function Greeting() {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    if (hour < 12) {
      setGreeting("Good morning");
    } else if (hour < 18) {
      setGreeting("Good afternoon");
    } else if (hour < 22) {
      setGreeting("Good evening");
    } else {
      setGreeting("Good night");
    }
  }, []);

  return (
    <Text style={{ fontFamily: "heading" }} className="uppercase text-5xl mt-5">
      {greeting}
    </Text>
  );
}

function WeatherWidget() {
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
      className="h-40 rounded-3xl bg-gray-200 flex-1 justify-end p-5 active:bg-gray-300"
    >
      <ActivityIndicator />
    </Pressable>
  ) : weatherData ? (
    <Pressable
      style={({ pressed }) => ({
        backgroundColor: pressed ? "lightgray" : "white",
      })}
      onPress={onPressHandler}
      className="h-40 rounded-3xl bg-gray-200 flex-1 justify-end p-5 active:bg-gray-300"
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
  ) : (
    <Pressable
      style={({ pressed }) => ({
        backgroundColor: pressed ? "lightgray" : "white",
      })}
      onPress={onPressHandler}
      className="h-40 rounded-3xl bg-gray-200 flex-1 justify-end p-5 active:bg-gray-300"
    >
      <Text>Tap to enable</Text>
    </Pressable>
  );
}

function TodaysDate() {
  return (
    <View className="h-40 rounded-3xl bg-gray-200 flex-1 justify-end p-5">
      <Icon size={40} style={{ marginLeft: -5 }}>
        calendar_today
      </Icon>
      <Text className="mt-1 text-xl" style={{ fontFamily: "body_700" }}>
        {dayjs().format("MMM Do")}
      </Text>
      <Text>{dayjs().format("YYYY")}</Text>
    </View>
  );
}

function PlanDayPrompt() {
  return (
    <View
      className="h-24 rounded-3xl bg-gray-200 flex-1"
      style={{ marginBottom: 15 }}
    >
      <Text>Plan your day</Text>
    </View>
  );
}

function TodaysTasks() {
  return (
    <View
      className="h-24 rounded-3xl bg-gray-200 flex-1"
      style={{ marginBottom: 15 }}
    >
      <Text>Today's tasks!</Text>
    </View>
  );
}

function RecentActivity() {
  return (
    <View
      className="h-96 rounded-3xl bg-gray-200 flex-1"
      style={{ marginBottom: 60 }}
    >
      <Text>Recent activity</Text>
    </View>
  );
}

export default function Index() {
  const { signOut } = useSession();
  const { session, error } = useUser();

  return (
    <ScrollView className="p-5">
      <StatusBar barStyle="dark-content" />
      <Greeting />

      <Text
        className="uppercase text-sm opacity-60 mt-2"
        style={{ fontFamily: "body_700" }}
      >
        Today's rundown
      </Text>
      <View
        className="flex-row mt-1.5"
        style={{ columnGap: 15, marginBottom: 15 }}
      >
        <WeatherWidget />
        <TodaysDate />
      </View>
      <PlanDayPrompt />
      <TodaysTasks />
      <RecentActivity />
    </ScrollView>
  );
}
