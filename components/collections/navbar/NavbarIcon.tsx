import { useColorTheme } from "@/ui/color/theme-provider";
import Emoji from "@/ui/Emoji";
import { View } from "react-native";

export const NavbarIcon = ({ emoji, isLoading, isAll }) => {
  const theme = useColorTheme();
  return isLoading ? (
    <View
      style={{
        width: 30,
        height: 30,
        borderRadius: 999,
        backgroundColor: theme[4],
      }}
    />
  ) : (
    !isAll && <Emoji emoji={emoji} size={30} />
  );
};
