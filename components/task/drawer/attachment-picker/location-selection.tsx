import { LocationPickerModal } from "@/components/collections/views/map";
import { Button } from "@/ui/Button";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import * as Location from "expo-location";
import { useState } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { useTaskDrawerContext } from "../context";

export function LocationSelector({ handleBack }) {
  const theme = useColorTheme();
  const { task, updateTask } = useTaskDrawerContext();

  const [loading, setLoading] = useState(false);

  const handleCurrent = async () => {
    setLoading(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      // const place = await Location.reverseGeocodeAsync({
      //   latitude,
      //   longitude,
      // });
      // fetch the place details with nominatim
      const placeDetails = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
      ).then((r) => r.json());
      if (!placeDetails || !placeDetails.place_id) {
        Toast.show({
          type: "error",
          text1: "Could not find location",
        });
        return;
      }
      updateTask({
        location: {
          placeId: placeDetails.place_id,
          name: placeDetails.display_name,
          coordinates: [latitude, longitude],
        },
      });
      handleBack();
    } else {
      Toast.show({
        type: "error",
        text1: "Something went wrong",
      });
    }
    setLoading(false);
  };

  return (
    <>
      <View style={{ width: "100%", flexDirection: "row", gap: 10 }}>
        <Button
          containerStyle={{ flex: 1 }}
          variant="filled"
          large
          icon="near_me"
          text="Current"
          onPress={handleCurrent}
          isLoading={loading}
          iconStyle={{ transform: [{ scale: 1.3 }] }}
          backgroundColors={{
            default: addHslAlpha(theme[11], 0.1),
            hovered: addHslAlpha(theme[11], 0.2),
            pressed: addHslAlpha(theme[11], 0.3),
          }}
        />
        <LocationPickerModal
          hideSkip
          defaultQuery={task.name?.trim()}
          closeOnSelect
          onLocationSelect={(location) =>
            updateTask({
              location: {
                placeId: location.place_id,
                name: location.display_name,
                coordinates: [location.lat, location.lon],
              },
            })
          }
        >
          <Button
            containerStyle={{ flex: 1 }}
            backgroundColors={{
              default: addHslAlpha(theme[11], 0.1),
              hovered: addHslAlpha(theme[11], 0.2),
              pressed: addHslAlpha(theme[11], 0.3),
            }}
            variant="filled"
            large
            icon="search"
            text="Search"
          />
        </LocationPickerModal>
      </View>
    </>
  );
}
