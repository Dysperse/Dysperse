import BottomSheet from "@/ui/BottomSheet";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import ErrorAlert from "@/ui/Error";
import IconButton from "@/ui/IconButton";
import Spinner from "@/ui/Spinner";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import * as FileSystem from "expo-file-system";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as MediaLibrary from "expo-media-library";
import React, { cloneElement, useCallback, useRef, useState } from "react";
import { Linking, Platform, View } from "react-native";
import Toast from "react-native-toast-message";

async function saveImageToCameraRoll(imageUrl) {
  try {
    if (Platform.OS === "web") {
      const image = await fetch(imageUrl);
      const imageBlog = await image.blob();
      const t = URL.createObjectURL(imageBlog);

      const link = document.createElement("a");
      link.href = t;
      link.download = imageUrl.split("/").pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Get permission to access media library
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Toast.show({
          type: "error",
          text1:
            "Please give camera roll access to dysperse. You can do this in your device settings.",
        });
        return;
      }

      // Download the image to a temporary file
      const fileUri = `${FileSystem.cacheDirectory}downloadedImage.jpg`;
      const { uri } = await FileSystem.downloadAsync(imageUrl, fileUri);

      // Save the image to the media library
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync("Download", asset, false);
      Toast.show({ type: "success", text1: "Image saved to gallery" });
    }
  } catch (error) {
    console.error(error);
    Toast.show({ type: "error" });
  }
}

export const ImageViewer = ({ children, image }) => {
  const ref = useRef<BottomSheetModal>();
  const theme = useColorTheme();
  const [state, setState] = useState<"loading" | "error" | "success">(
    "loading"
  );
  const handleOpen = useCallback(() => ref.current.present(), []);
  const handleClose = useCallback(() => ref.current.dismiss(), []);

  const trigger = cloneElement(
    children,
    image
      ? {
          onPress: handleOpen,
        }
      : undefined
  );

  return (
    <>
      {trigger}
      {image && (
        <BottomSheet
          snapPoints={["100%"]}
          sheetRef={ref}
          onClose={handleClose}
          handleComponent={() => null}
          maxWidth="100%"
          backgroundStyle={{
            backgroundColor: "transparent",
            ...(Platform.OS === "web" && { backdropFilter: "blur(10px)" }),
          }}
          animationConfigs={{
            stiffness: 400,
            damping: 40,
            overshootClamping: true,
          }}
        >
          <View
            style={{
              padding: 20,
              flex: 1,
              borderRadius: 20,
              backgroundColor: addHslAlpha(theme[1], 0.4),
            }}
          >
            <View
              style={{
                width: "100%",
                aspectRatio: 1,
                justifyContent: "center",
                alignItems: "center",
                flex: 1,
              }}
            >
              {state === "success" ? (
                <Image
                  onError={() => setState("error")}
                  onLoad={() => setState("success")}
                  contentFit="contain"
                  contentPosition="center"
                  source={{ uri: image }}
                  style={{ flex: 1, width: "100%" }}
                />
              ) : state === "error" ? (
                <ErrorAlert />
              ) : (
                <Spinner />
              )}
            </View>
            <LinearGradient
              colors={[theme[1], "transparent"]}
              style={{
                padding: 20,
                gap: 5,
                flexDirection: "row",
                position: "absolute",
                top: 0,
                right: 0,
                width: "100%",
                height: 200,
                zIndex: -1,
              }}
            />
            <View
              style={{
                padding: 20,
                gap: 5,
                flexDirection: "row",
                position: "absolute",
                top: 0,
                right: 0,
                height: 90,
                width: "100%",
              }}
            >
              <IconButton
                size={50}
                variant="outlined"
                style={{ borderWidth: 2 }}
                onPress={handleClose}
                icon="close"
              />
              <View style={{ flex: 1 }} />
              <IconButton
                size={50}
                variant="outlined"
                style={{ borderWidth: 2 }}
                onPress={() => Linking.openURL(image)}
                icon="open_in_new"
              />
              <IconButton
                size={50}
                variant="outlined"
                style={{ borderWidth: 2 }}
                onPress={() => {
                  // Save image to gallery
                  saveImageToCameraRoll(image);
                }}
                icon="download"
              />
            </View>
          </View>
        </BottomSheet>
      )}
    </>
  );
};
