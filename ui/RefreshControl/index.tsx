import { RefreshControlProps } from "react-native";
import { RefreshControl as RefreshControlComponent } from "react-native-gesture-handler";
import { useColorTheme } from "../color/theme-provider";

export default function RefreshControl(props: RefreshControlProps) {
  const theme = useColorTheme();
  return (
    <RefreshControlComponent
      progressBackgroundColor={theme[5]}
      colors={[theme[11]]}
      tintColor={theme[11]}
      {...props}
    />
  );
}
