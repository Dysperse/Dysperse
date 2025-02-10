import { JsStack } from "@/components/layout/_stack";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { useColorTheme } from "@/ui/color/theme-provider";
import { TransitionPresets } from "@react-navigation/stack";
import { createContext, useContext, useRef } from "react";

const LoginContext = createContext(null);
export const useLoginContext = () => useContext(LoginContext);

export default function Layout() {
  const breakpoints = useResponsiveBreakpoints();

  const theme = useColorTheme();
  const signupData = useRef({
    email: "",
    password: "",
    twoFactorCode: "",
  });

  return (
    <LoginContext.Provider value={signupData.current}>
      <JsStack
        screenOptions={{
          header: () => null,
          gestureResponseDistance: 10000,
          detachPreviousScreen: true,
          cardStyle: {
            backgroundColor: theme[1],
            paddingHorizontal: breakpoints.md ? 40 : 10,
            paddingLeft: breakpoints.md ? 60 : undefined,
          },
          ...TransitionPresets.SlideFromRightIOS,
        }}
      />
    </LoginContext.Provider>
  );
}
