import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import BottomSheet from "@/ui/BottomSheet";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import * as FileSystem from "expo-file-system";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as MediaLibrary from "expo-media-library";
import React, {
  cloneElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Linking, Platform, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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

async function getImageCaption(sessionToken, fileUrl) {
  const errorMessage = "Even AI failed to describe this image. Try again later";
  try {
    // file URLs are hosted on a CDN. we need to upload the file to the inference API. convert it to a raw binary
    const file = await fetch(fileUrl);
    const blob = await file.blob();
    const data = new FormData();
    data.append("file", blob);

    const token = await sendApiRequest(
      sessionToken,
      "POST",
      "ai/image-caption"
    );
    const response = await fetch(
      "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: blob,
      }
    );
    const result = await response.json();
    return result?.[0]?.generated_text || errorMessage;
  } catch (error) {
    console.error(error);
    return errorMessage;
  }
}

function ImageCaption({ image }) {
  const { sessionToken } = useUser();
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(true);
  const breakpoints = useResponsiveBreakpoints();
  const theme = useColorTheme();

  useEffect(() => {
    getImageCaption(sessionToken, image).then((caption) => {
      setCaption(caption);
      setLoading(false);
    });
  }, [image, sessionToken]);

  return (
    <View
      style={{
        padding: 20,
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <View
        style={{
          backgroundColor: theme[2],
          padding: 10,
          paddingHorizontal: breakpoints.md ? 10 : 30,
          borderRadius: 10,
          flexDirection: "row",
          shadowColor: theme[12],
          shadowOffset: {
            width: 0,
            height: 20,
          },
          shadowRadius: 10,
          shadowOpacity: 0.1,
          justifyContent: "center",
          gap: 10,
          maxWidth: "100%",
        }}
      >
        <Icon style={{ flexShrink: 0 }}>magic_button</Icon>
        <View style={{ minWidth: 0, maxWidth: "100%" }}>
          <Text variant="eyebrow">AI description</Text>
          <Text style={{ color: theme[11] }}>
            {loading ? "Loading..." : JSON.stringify(caption)}
          </Text>
        </View>
      </View>
    </View>
  );
}

export const ImageViewer = ({ children, image }) => {
  const ref = useRef<BottomSheetModal>();
  const insets = useSafeAreaInsets();
  const theme = useColorTheme();
  const { width, height } = useWindowDimensions();
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
          <ImageCaption image={image} />
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
              <Image
                onError={() => setState("error")}
                onLoadEnd={() => setState("success")}
                contentFit="contain"
                contentPosition="center"
                source={{ uri: image }}
                style={{ flex: 1, width, height }}
              />
              {state === "loading" && (
                <View
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 9999,
                  }}
                >
                  <Spinner />
                </View>
              )}
            </View>
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
              height: 200 + insets.top,
              zIndex: -1,
            }}
          />
          <View
            style={{
              padding: 20,
              paddingTop: insets.top + 20,
              gap: 5,
              flexDirection: "row",
              position: "absolute",
              top: 0,
              right: 0,
              height: 90,
              width: "100%",
              ...(Platform.OS === "web" &&
                ({ marginTop: "env(titlebar-area-height,0)" } as any)),
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
        </BottomSheet>
      )}
    </>
  );
};
