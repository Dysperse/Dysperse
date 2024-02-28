import { SettingsLayout } from "@/components/settings/layout";
import { Button } from "@/ui/Button";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { CameraView, useCameraPermissions } from "expo-camera/next";
import * as WebBrowser from "expo-web-browser";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Page() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <SettingsLayout noScroll>
        <View style={[styles.container, { alignItems: "center", gap: 10 }]}>
          <Text style={{ textAlign: "center", fontSize: 20 }} weight={700}>
            We need your permission to show the camera
          </Text>
          <Button
            onPress={requestPermission}
            text="Grant permission"
            variant="filled"
            iconPosition="end"
            icon="arrow_forward_ios"
            large
          />
        </View>
      </SettingsLayout>
    );
  }

  const handleBarCodeScanned = ({ data }: { data: any }) => {
    try {
      const { raw } = data;
      if (
        raw.includes(
          `${process.env.EXPO_PUBLIC_API_URL}/user/session/qr-auth?token=`
        ) ||
        raw.includes(`https://api.dysperse.com/user/session/qr-auth?token=`)
      ) {
        WebBrowser.openBrowserAsync(raw);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SettingsLayout noScroll hideBack>
      <View style={{ height: height + insets.top + insets.bottom }}>
        <View
          style={{
            padding: 10,
            paddingTop: 10 + insets.top,
            height: insets.top + 80,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <IconButton
            variant="outlined"
            size={55}
            icon="close"
            onPress={() => {}}
          />
          <Text weight={700}>Scan QR Code</Text>
        </View>
        <View style={{ flex: 1, position: "relative" }}>
          <CameraView
            style={styles.camera}
            facing="back"
            barCodeScannerSettings={{
              barCodeTypes: ["qr"],
            }}
            onBarcodeScanned={handleBarCodeScanned}
          />
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              gap: 10,
            }}
          >
            <View
              style={{
                width: width - 100,
                aspectRatio: "1/1",
                borderWidth: 5,
                borderRadius: 50,
                borderColor: "rgba(255,255,255,.5)",
              }}
            />
            <View style={{ maxWidth: 200 }}>
              <Text
                style={{ textAlign: "center", color: "rgba(255,255,255,.5)" }}
              >
                Center the QR code within the frame to instantly log in
              </Text>
            </View>
          </View>
        </View>
      </View>
    </SettingsLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  camera: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
});
