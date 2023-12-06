import { Image } from "expo-image";
import { Link } from "expo-router";
import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUser } from "../context/useUser";
import Logo from "./logo";

export default function AccountNavbar(props: any) {
  const insets = useSafeAreaInsets();
  const { session } = useUser();

  return (
    // <BlurView intensity={60}>
    <View
      style={{ height: 64 + insets.top, paddingTop: insets.top }}
      className="flex-row px-4 items-center bg-white"
    >
      <Logo size={35} color={"black"} />
      <View style={{ flexGrow: 1 }} />
      <Link href="/(app)/account">
        <Image
          source={{
            uri: session?.user?.Profile?.picture,
          }}
          className="rounded-full"
          style={{ width: 35, height: 35 }}
        />
      </Link>
    </View>
    //  </BlurView>
  );
}
