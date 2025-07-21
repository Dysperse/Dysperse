import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { useEffect, useState } from "react";
import { InteractionManager, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { useTaskDrawerContext } from "../context";

export function PhotoSelection({ handleBack }) {
  const theme = useColorTheme();
  const { task, updateTask } = useTaskDrawerContext();

  const [photos, setPhotos] = useState([]);
  const [permission, requestPermission] = MediaLibrary.usePermissions();

  useEffect(() => {
    const getPhotos = async () => {
      if (!permission?.granted) {
        const { status } = await requestPermission();
        if (status !== "granted") return;
      }

      const assets = await MediaLibrary.getAssetsAsync({
        mediaType: "photo",
        first: 10,
        sortBy: [["creationTime", false]], // false = descending
      });

      setPhotos(assets.assets);
    };

    setTimeout(
      () => InteractionManager.runAfterInteractions(() => getPhotos()),
      200
    );
  }, []);

  return (
    <View style={{ width: "100%" }}>
      <FlatList
        horizontal
        data={photos}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        ListHeaderComponent={() => (
          <IconButton
            size={100}
            variant="filled"
            backgroundColors={{
              default: addHslAlpha(theme[11], 0.1),
              hovered: addHslAlpha(theme[11], 0.2),
              pressed: addHslAlpha(theme[11], 0.3),
            }}
            style={{ borderRadius: 20, marginRight: 7 }}
            onPress={async () => {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                quality: 1,
              });

              if (!result.canceled) {
                const asset = result.assets[0];
                updateTask({
                  attachments: [
                    ...(task.attachments || []),
                    { uri: asset.uri, type: "image" },
                  ],
                });
              }

              Toast.show({ type: "info", text1: "Coming soon!" });
            }}
          >
            <Icon size={40}>add</Icon>
          </IconButton>
        )}
        renderItem={({ item }) => (
          <IconButton
            size={100}
            variant="filled"
            onPress={() => {
              Toast.show({ type: "info", text1: "Coming soon!" });
            }}
            style={{ borderRadius: 20, marginRight: 7, overflow: "hidden" }}
          >
            <Image
              source={{ uri: item.uri }}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 20,
              }}
            />
          </IconButton>
        )}
      />
    </View>
  );
}
