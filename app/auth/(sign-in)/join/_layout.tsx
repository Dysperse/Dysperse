import { JsStack } from "@/components/layout/_stack";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import { createContext, useContext, useRef } from "react";

const SignupContext = createContext(null);
export const useSignupContext = () => useContext(SignupContext);

export default function Layout() {
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
    // picture:
    // birthday:
  });

  return (
    <SignupContext.Provider value={signupData.current}>
      <JsStack
        screenOptions={{
          header: () => null,
          gestureResponseDistance: 10000,
          cardStyle: {
            backgroundColor: theme[1],
            paddingHorizontal: 40,
            paddingLeft: 60,
          },
        }}
      />
    </SignupContext.Provider>
  );
}
