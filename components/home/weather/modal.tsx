import weatherCodes from "@/components/home/weather/weatherCodes.json";
import { BottomSheetBackHandler } from "@/ui/BottomSheet/BottomSheetBackHandler";
import { BottomSheetBackdropComponent } from "@/ui/BottomSheet/BottomSheetBackdropComponent";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import * as NavigationBar from "expo-navigation-bar";
import { cloneElement, useCallback, useMemo, useRef } from "react";
import { Pressable, View } from "react-native";
import airQuality from "./airQuality.json";
import { FlatList, ScrollView } from "react-native-gesture-handler";

const getAirQualityInfo = (index) => {
  const result = airQuality.find(
    (category) => index >= category.index.min && index <= category.index.max
  );

  return result || null; // Return null if no matching category is found
};

export function WeatherModal({
  weather,
  location,
  airQuality,
  children,
  isNight,
}) {
  const ref = useRef<BottomSheetModal>(null);

  const weatherDescription =
    weatherCodes[weather.current_weather.weathercode][
      isNight ? "night" : "day"
    ];

  const gradient = useMemo(
    () => weatherDescription.backgroundGradient,
    [weatherDescription]
  );
  const color = useMemo(
    () => weatherDescription.textColor,
    [weatherDescription]
  );

  const hour = useMemo(() => dayjs().hour(), []);

  // callbacks
  const handleOpen = useCallback(() => {
    ref.current?.present();
    NavigationBar.setButtonStyleAsync("light");
    NavigationBar.setBackgroundColorAsync(gradient[1]);
    NavigationBar.setBorderColorAsync(gradient[1]);
  }, []);

  const handleClose = useCallback(() => {
    ref.current?.close();
    NavigationBar.setButtonStyleAsync("dark");
    NavigationBar.setBackgroundColorAsync("#eee");
    NavigationBar.setBorderColorAsync("#eee");
  }, []);

  const trigger = cloneElement(children, { onPress: handleOpen });
  const base =
    weatherDescription.textColor === "#fff"
      ? "rgba(255, 255, 255, 0.1)"
      : "rgba(0, 0, 0, 0.1)";

  const WeatherCard = useMemo(() => {
    return ({ icon, heading, subheading, onPress = () => {} }) => (
      <Pressable
        onPress={onPress}
        className="flex-row px-5 flex-1 py-3 rounded-2xl items-center"
        style={{ backgroundColor: base }}
      >
        <Icon style={{ color }}>{icon}</Icon>
        <View className="pl-4 pr-3" style={{ minWidth: 0 }}>
          <Text
            style={{ fontFamily: "body_500", opacity: 0.7, color }}
            numberOfLines={1}
          >
            {heading}
          </Text>
          <Text style={{ color }}>{subheading}</Text>
        </View>
      </Pressable>
    );
  }, []); // Note: The second argument to useMemo is the dependency array. Since there are no dependencies, it's an empty array.

  return (
    <>
      {trigger}
      <BottomSheetModal
        ref={ref}
        snapPoints={["60%", "90%"]}
        backdropComponent={BottomSheetBackdropComponent}
        onDismiss={handleClose}
        handleIndicatorStyle={{
          backgroundColor: color,
        }}
        backgroundComponent={(props) => (
          <LinearGradient
            colors={[gradient[1], gradient[1], ...gradient]}
            {...props}
            style={{
              ...(props.style as any),
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}
          />
        )}
      >
        <BottomSheetBackHandler handleClose={handleClose} />
        <BottomSheetScrollView>
          <View className="p-5 py-10">
            <View className="flex items-center">
              <Icon size={60} style={{ color }}>
                {
                  weatherCodes[weather.current_weather.weathercode][
                    isNight ? "night" : "day"
                  ].icon
                }
              </Icon>
            </View>
            <Text
              textClassName="text-5xl mb-1 text-center mt-4"
              style={{ fontFamily: "body_700", color, marginRight: -13 }}
            >
              {Math.round(weather.current_weather.temperature)}&deg;
            </Text>
            <Text
              textClassName="text-center text-lg mb-1"
              style={{ color, opacity: 0.9 }}
            >
              {weatherDescription.description}
            </Text>
            <Text
              textClassName="text-center mb-1"
              style={{ color, opacity: 0.7 }}
            >
              {location.address.city || location.address.county},{" "}
              {location.address.state}
            </Text>
            {/* hi daddy noah */}
            <View className="flex-row" style={{ marginTop: 15, gap: 15 }}>
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
            <View className="flex-row" style={{ marginTop: 15, gap: 15 }}>
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
            <View className="flex-row" style={{ marginTop: 15, gap: 15 }}>
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
            <View className="flex-row" style={{ marginVertical: 15, gap: 15 }}>
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
            <WeatherCard
              icon="eco"
              heading="Air Quality"
              onPress={() =>
                alert(
                  getAirQualityInfo(airQuality.current.pm2_5)?.meaning || ""
                )
              }
              subheading={`${
                getAirQualityInfo(airQuality?.current?.pm2_5)?.category
              } — ${airQuality.current.pm2_5} ${
                airQuality.current_units.pm2_5
              }`}
            />
          </View>
          <View className="px-5 -mt-2">
            <Text
              textClassName="uppercase opacity-60"
              style={{ color, fontFamily: "body_600" }}
            >
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
                  paddingVertical: 10,
                  flexShrink: 0,
                  borderRadius: 20,
                  display: "flex",
                  alignItems: "center",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Icon style={{ color, marginBottom: 7 }}>
                  {
                    weatherCodes[weather.hourly.weathercode[index]][
                      isNight ? "night" : "day"
                    ].icon
                  }
                </Icon>
                <Text style={{ color, marginRight: -3 }}>{-~item}&deg;</Text>
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
        </BottomSheetScrollView>
      </BottomSheetModal>
    </>
  );
}
