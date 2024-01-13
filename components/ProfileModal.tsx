import { ProfilePicture } from "@/ui/Avatar";
import BottomSheet from "@/ui/BottomSheet";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { ColorThemeProvider } from "@/ui/color/theme-provider";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { cloneElement, useCallback, useRef } from "react";
import { View, useColorScheme } from "react-native";
import useSWR from "swr";

function ProfileModalContent({ email }) {
  const { data, error } = useSWR(["user/profile", { email }]);
  const theme = useColor(data.profile.theme, useColorScheme() === "dark");

  return data ? (
    <ColorThemeProvider theme={theme}>
      <View style={{ backgroundColor: theme[1], flex: 1 }}>
        <LinearGradient
          colors={[theme[9], theme[5]]}
          style={{
            padding: 30,
            height: 140,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
        >
          <ProfilePicture
            style={{ top: 80, position: "absolute" }}
            name={data.profile?.name || "--"}
            image={data.profile?.picture}
            size={90}
          />
        </LinearGradient>
        <View style={{ padding: 35, marginTop: 10 }}>
          <Text weight={700} style={{ fontSize: 50 }} heading>
            {data.profile.name}
          </Text>
          <Text style={{ fontSize: 20 }}>{data.profile.email}</Text>
          <Text style={{ fontSize: 20 }}>{data.profile.bio}</Text>
        </View>
      </View>
    </ColorThemeProvider>
  ) : (
    <Text style={{ color: theme[2], fontSize: 20 }}>
      {error ? "Error" : "Loading..."}
    </Text>
  );
}

export function ProfileModal({ children, email }) {
  const ref = useRef<BottomSheetModal>(null);
  const handleOpen = useCallback(() => ref.current?.present(), []);
  const handleClose = useCallback(() => ref.current?.close(), []);
  const trigger = cloneElement(children, { onPress: handleOpen });

  return (
    <>
      {trigger}
      <BottomSheet
        sheetRef={ref}
        onClose={handleClose}
        snapPoints={["80%"]}
        handleComponent={() => null}
        maxWidth={500}
      >
        <ProfileModalContent email={email} />
      </BottomSheet>
    </>
  );
}
