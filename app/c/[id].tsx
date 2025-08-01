import Collection from "@/app/(app)/[tab]/collections/[id]/[type]";
import { StorageContextProvider } from "@/context/storageContext";
import { Button, ButtonText } from "@/ui/Button";
import { ColorThemeProvider, useColorTheme } from "@/ui/color/theme-provider";
import Icon from "@/ui/Icon";
import Logo from "@/ui/logo";
import Text from "@/ui/Text";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import {
  Linking,
  Platform,
  Pressable,
  useWindowDimensions,
  View,
} from "react-native";
import { MenuProvider } from "react-native-popup-menu";

function inIframe() {
  if (Platform.OS !== "web") return false;
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}

export default function Page() {
  const { width, height } = useWindowDimensions();
  const theme = useColorTheme();
  return (
    <MenuProvider>
      <BottomSheetModalProvider>
        <StorageContextProvider>
          <ColorThemeProvider theme={theme}>
            <View
              style={{
                width,
                height,
                backgroundColor: theme[2],
                padding: 20,
                flexDirection: "column",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 15,
                  gap: 5,
                  justifyContent: "space-between",
                  marginTop: -5,
                }}
              >
                <Pressable
                  onPress={() =>
                    Linking.openURL(
                      "https://dysperse.com?utm_source=public-collection"
                    )
                  }
                  style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
                >
                  <Logo size={30} color="gray" />
                  <Text style={{ color: theme[11], fontSize: 20 }} weight={900}>
                    #dysperse
                  </Text>
                  <Icon>north_east</Icon>
                </Pressable>

                <Button
                  variant="filled"
                  onPress={() => {
                    if (inIframe()) {
                      Linking.openURL("https://go.dysperse.com/auth");
                    } else {
                      router.push("/auth");
                    }
                  }}
                >
                  <Icon>login</Icon>
                  <ButtonText>Sign in</ButtonText>
                </Button>
              </View>
              <Collection isPublic />
            </View>
          </ColorThemeProvider>
        </StorageContextProvider>
      </BottomSheetModalProvider>
    </MenuProvider>
  );
}

