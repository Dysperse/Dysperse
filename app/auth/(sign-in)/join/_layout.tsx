import { JsStack } from "@/components/layout/_stack";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { useColorTheme } from "@/ui/color/theme-provider";
import { TransitionPresets } from "@react-navigation/stack";
import dayjs from "dayjs";
import { createContext, useContext, useRef } from "react";

const SignupContext = createContext(null);
export const useSignupContext = () => useContext(SignupContext);

export default function Layout() {
  const breakpoints = useResponsiveBreakpoints();

  const theme = useColorTheme();
  const signupData = useRef({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    captchaToken: "",
    timeZone: dayjs.tz.guess(),
    theme: "mint",
    allowMarketingEmails: true,
    isGoogle: false,
    methods: [],
    tasks: ["", "", ""],
    bio: "",
  });

  return (
    <SignupContext.Provider value={signupData.current}>
      <JsStack
        id={undefined}
        screenOptions={{
          header: () => null,
          gestureResponseDistance: 10000,
          cardStyle: {
            backgroundColor: theme[1],
            paddingHorizontal: breakpoints.md ? 40 : 10,
            paddingLeft: breakpoints.md ? 60 : undefined,
          },
          ...TransitionPresets.SlideFromRightIOS,
        }}
      />
    </SignupContext.Provider>
  );
}

