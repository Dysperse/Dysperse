import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { ColorThemeProvider } from "@/ui/color/theme-provider";
import * as FileSystem from "expo-file-system";
import * as Updates from "expo-updates";
import React from "react";
import { Platform, View, useWindowDimensions } from "react-native";
import "react-native-gesture-handler";

export function ErrorBoundaryComponent() {
  const theme = useColor("mint");
  const breakpoints = useResponsiveBreakpoints();
  const { width } = useWindowDimensions();

  return (
    <ColorThemeProvider theme={theme}>
      <View
        style={{
          backgroundColor: theme[1],
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
        }}
      >
        <View
          style={{
            width: 450,
            maxWidth: width - 40,
            justifyContent: "center",
            borderWidth: 1,
            borderColor: theme[6],
            padding: 30,
            borderRadius: 20,
            flexDirection: breakpoints.md ? "row" : "column",
            gap: 20,
          }}
        >
          <Emoji size={50} style={{ marginTop: 10 }} emoji="1F62C" />
          <View style={{ flex: breakpoints.md ? 1 : undefined }}>
            <Text style={{ fontSize: 30 }} weight={900}>
              Well, that's embarrassing...
            </Text>
            <Text style={{ fontSize: 20, opacity: 0.6 }}>
              Dysperse unexpectedly crashed, and our team has been notified. Try
              reopening the app to see if that fixes the issue.
            </Text>

            <Button
              onPress={() => {
                if (Platform.OS === "web") {
                  (window as any).disableSaveData = true;
                  localStorage.removeItem("app-cache");
                  window.location.reload();
                  return;
                } else if (Platform.OS === "android") {
                  // Cache file exists in the cache directory FileSystem.cacheDirectory + "dysperse-cache/cache.json"
                  // Delete the file

                  const cacheFilePath =
                    FileSystem.cacheDirectory + "dysperse-cache/cache.json";
                  FileSystem.deleteAsync(cacheFilePath, {
                    idempotent: true,
                  }).catch((error) => {
                    console.error("Failed to delete cache file:", error);
                  });
                }
                Updates.reloadAsync();
              }}
              variant="outlined"
              height={60}
              containerStyle={{ marginTop: 10 }}
            >
              <Icon>loop</Icon>
              <ButtonText>Reload</ButtonText>
            </Button>
          </View>
        </View>
      </View>
    </ColorThemeProvider>
  );
}

