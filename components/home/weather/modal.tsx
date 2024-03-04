import weatherCodes from "@/components/home/weather/weatherCodes.json";
import BottomSheet from "@/ui/BottomSheet";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import React, { cloneElement, useCallback, useMemo, useRef } from "react";
import { Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import airQuality from "./airQuality.json";

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
    textAlign: "center",
  },
  temperature: {
    marginRight: -13,
    fontSize: 60,
    textAlign: "center",
    marginTop: 10,
    marginLeft: -10,
  },
  weatherCard: {
    flex: 1,
    gap: 15,
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: "center",
    borderRadius: 20,
  },
});

export function WeatherModal({
  weather,
  // location,
  airQuality,
  children,
  isNight,
}: any) {
  const { width } = useWindowDimensions();
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
  const handleOpen = useCallback(() => ref.current?.present(), []);

  const handleClose = useCallback(() => {
    ref.current?.close();
  }, []);

  const trigger = cloneElement(children, { onPress: handleOpen });
  const base =
    weatherDescription.textColor === "#fff"
      ? "rgba(255, 255, 255, 0.1)"
      : "rgba(0, 0, 0, 0.1)";

  const WeatherCard = useMemo(() => {
    return ({ icon, heading, subheading, onPress = () => {} }: any) => (
      <Pressable
        onPress={onPress}
        style={[weatherStyles.weatherCard, { backgroundColor: base }]}
      >
        <Icon style={{ color }} size={30}>
          {icon}
        </Icon>
        <View style={{ minWidth: 0, flex: 1 }}>
          <Text
            variant="eyebrow"
            numberOfLines={1}
            style={{ color, marginBottom: 3 }}
          >
            {heading}
          </Text>
          <Text style={{ color }}>{subheading}</Text>
        </View>
      </Pressable>
    );
  }, [base, color]); // Note: The second argument to useMemo is the dependency array. Since there are no dependencies, it's an empty array.

  return (
    <>
      {trigger}
      <BottomSheet
        onClose={handleClose}
        handleIndicatorStyle={{
          backgroundColor: base.replace("0.1", "0.3"),
        }}
        sheetRef={ref}
        style={{ maxWidth: 500, marginHorizontal: "auto" }}
        snapPoints={width > 600 ? ["90"] : ["60%", "90%"]}
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
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <View style={{ paddingHorizontal: 15, paddingVertical: 20 }}>
            <View style={{ alignItems: "center" }}>
              <Icon size={70} style={{ color, marginTop: 40 }}>
                {
                  weatherCodes[weather.current_weather.weathercode][
                    isNight ? "night" : "day"
                  ].icon
                }
              </Icon>
              !
            </View>
            <Text weight={200} style={[weatherStyles.temperature, { color }]}>
              {Math.round(weather.current_weather.temperature)}&deg;
            </Text>
            <Text style={[weatherStyles.description, { color }]} weight={800}>
              {weatherDescription.description}
            </Text>
            {/* <Text
              textClassName="text-center mb-1"
              style={{ color, opacity: 0.7 }}
            >
              {location.address.city || location.address.county},{" "}
              {location.address.state}
            </Text> */}
            {/* hi daddy noah */}
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
            <View style={{ marginTop: 10 }} />
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
        </BottomSheetScrollView>
      </BottomSheet>
    </>
  );
}
