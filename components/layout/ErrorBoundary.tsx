import { useSession } from "@/context/AuthProvider";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { ColorThemeProvider } from "@/ui/color/theme-provider";
import * as Updates from "expo-updates";
import React from "react";
import { Platform, View, useWindowDimensions } from "react-native";
import "react-native-gesture-handler";
import { CLEAR_APP_CACHE } from "./SWRWrapper";

export function ErrorBoundaryComponent() {
  const theme = useColor("mint");
  const breakpoints = useResponsiveBreakpoints();
  const { width } = useWindowDimensions();
  const { signOut } = useSession() || {};
  const [isLoading, setIsLoading] = React.useState(false);

  return (
    <ColorThemeProvider theme={theme}>
      <View
        style={{
          backgroundColor: theme[1],
          alignItems: "center",
          flex: 1,
        }}
      >
        <View
          style={{
            width: 400,
            maxWidth: width - 40,
            justifyContent: "center",
            padding: 30,
            borderRadius: 20,
            flexDirection: "column",
            gap: 10,
            marginVertical: "auto",
          }}
        >
          <Icon size={60}>heart_broken</Icon>
          <View
            style={{
              flex: breakpoints.md && Platform.OS === "web" ? 1 : undefined,
            }}
          >
            <Text
              style={{
                fontSize: 30,
                color: theme[11],
                fontFamily: "serifText700",
                marginBottom: 10,
              }}
            >
              Well that's sad...
            </Text>
            <Text
              style={{
                opacity: 0.6,
                color: theme[11],
              }}
              weight={400}
            >
              Dysperse unexpectedly crashed and our team has been notified of
              this issue. For the time being, see if reloading helps.
            </Text>

            <Button
              onPress={() => {
                setIsLoading(true);
                CLEAR_APP_CACHE();
                Updates.reloadAsync();
              }}
              variant="filled"
              containerStyle={{ marginTop: 10 }}
              text="Reload"
              icon="refresh"
              bold
              isLoading={isLoading}
              large
            />
            <Button
              onPress={() => {
                signOut();
              }}
              variant="filled"
              containerStyle={{ marginTop: 10 }}
              text="Sign out"
              icon="logout"
              bold
              large
            />
          </View>
        </View>
      </View>
    </ColorThemeProvider>
  );
}

