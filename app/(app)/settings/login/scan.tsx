import { SettingsLayout } from "@/components/settings/layout";
import { Button } from "@/ui/Button";
import Text from "@/ui/Text";
import { CameraView, useCameraPermissions } from "expo-camera/next";
import { StyleSheet, View } from "react-native";

export default function Page() {
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

  return (
    <SettingsLayout noScroll>
      <View style={{ flex: 1 }}>
        <CameraView
          style={styles.camera}
          facing="back"
          barCodeScannerSettings={{
            barCodeTypes: ["qr"],
          }}
        />
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
