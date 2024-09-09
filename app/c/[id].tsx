import Collection from "@/app/(app)/[tab]/collections/[id]/[type]";
import { StorageContextProvider } from "@/context/storageContext";
import { Button, ButtonText } from "@/ui/Button";
import { useColorTheme } from "@/ui/color/theme-provider";
import Icon from "@/ui/Icon";
import Logo from "@/ui/logo";
import Text from "@/ui/Text";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { useWindowDimensions, View } from "react-native";
import { MenuProvider } from "react-native-popup-menu";

export default function Page() {
  const { width, height } = useWindowDimensions();
  const theme = useColorTheme();
  return (
    <MenuProvider>
      <BottomSheetModalProvider>
        <StorageContextProvider>
          <View
            style={{ width, height, backgroundColor: theme[2], padding: 20 }}
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
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
              >
                <Logo size={30} />
                <Text style={{ color: theme[11], fontSize: 20 }} weight={300}>
                  dysperse
                </Text>
              </View>

              <Button variant="filled" onPress={() => router.push("/auth")}>
                <Icon>login</Icon>
                <ButtonText>Sign in</ButtonText>
              </Button>
            </View>
          </View>
          <Collection isPublic />
        </StorageContextProvider>
      </BottomSheetModalProvider>
    </MenuProvider>
  );
}
