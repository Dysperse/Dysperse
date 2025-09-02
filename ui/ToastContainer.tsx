import { Platform } from "react-native";
import { Toaster } from "sonner-native";
import Icon from "./Icon";
import Spinner from "./Spinner";
import { useColorTheme } from "./color/theme-provider";

export default function ToastContainer() {
  const theme = useColorTheme();

  return (
    <Toaster
      visibleToasts={1}
      style={{
        backgroundColor: theme[4],
        borderWidth: 2,
        borderColor: theme[6],
        ...(Platform.OS === "web" && {
          marginTop: "env(titlebar-area-height,0)",
        }),
      }}
      icons={{
        error: <Icon>error</Icon>,
        info: <Icon>info</Icon>,
        loading: <Spinner />,
        success: <Icon>check_circle</Icon>,
        warning: <Icon>warning</Icon>,
      }}
      styles={{
        title: { color: theme[11], fontFamily: "body_800" },
        description: {
          color: theme[9],
          fontFamily: "body_500",
        },
        toastContainer: { maxWidth: 400 },
        toastContent: { alignItems: "center" },
      }}
    />
  );
}
