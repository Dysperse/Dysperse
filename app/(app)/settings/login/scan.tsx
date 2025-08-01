import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import Text from "@/ui/Text";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Device from "expo-device";
import { router } from "expo-router";
import { useState } from "react";
import { Platform, StyleSheet, View, useWindowDimensions } from "react-native";
import Toast from "react-native-toast-message";

export default function Page() {
  const breakpoints = useResponsiveBreakpoints();
  const { session } = useSession();
  const { width } = useWindowDimensions();
  const [permission, requestPermission] = useCameraPermissions();
  const [isLoading, setIsLoading] = useState(false);

  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View
        style={{
          flex: 1,
          height: "100%",
          overflow: "hidden",
          backgroundColor: "#000",
        }}
      >
        <View
          style={[
            styles.container,
            {
              alignItems: "center",
              gap: 10,
              paddingHorizontal: 40,
            },
          ]}
        >
          <Text
            style={{ textAlign: "center", fontSize: 20, color: "#fff" }}
            weight={700}
          >
            We need your permission{"\n"}to show the camera
          </Text>
          <Button
            onPress={requestPermission}
            text="Grant permission"
            variant="filled"
            iconPosition="end"
            icon="arrow_forward_ios"
            large
            backgroundColors={{
              default: "rgba(255,255,255,.2)",
              hovered: "rgba(255,255,255,.3)",
              pressed: "rgba(255,255,255,.4)",
            }}
            textStyle={{ color: "#fff" }}
            iconStyle={{ color: "#fff" }}
          />
        </View>
      </View>
    );
  }

  const handleBarCodeScanned = async (data) => {
    try {
      const { raw } = data;
      if (raw.includes("?token=") && !isLoading) {
        setIsLoading(true);
        const res = await sendApiRequest(
          session,
          "PUT",
          "auth/qr",
          {},
          {
            body: JSON.stringify({
              token: raw.split("?token=")[1],
              deviceType: Device.deviceType,
              deviceName:
                Device.deviceName ||
                (Platform.OS === "web"
                  ? navigator.userAgent.split("(")[1].split(";")[0]
                  : "Unknown device"),
            }),
          }
        );

        if (res.error || !res.success) {
          throw new Error(res.error);
        }
        Toast.show({ type: "success", text1: "Logged in successfully!" });
        router.replace("/settings");
      }
    } catch (e) {
      console.error(e);
      Toast.show({ type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        height: "100%",
        overflow: "hidden",
      }}
    >
      <View style={{ flex: 1, position: "relative" }}>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={handleBarCodeScanned}
        />
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <View
            style={{
              width: breakpoints.md ? 300 : width - 100,
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

