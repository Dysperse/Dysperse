import { JsStack } from "@/components/layout/_stack";
import ContentWrapper from "@/components/layout/content";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { useColorTheme } from "@/ui/color/theme-provider";
import { ThemeProvider } from "@react-navigation/native";
import { TransitionPresets } from "@react-navigation/stack";

export default function Layout() {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();

  return (
    <ContentWrapper noPaddingTop>
      <ThemeProvider
        value={{
          colors: {
            background: theme[1],
            card: "transparent",
            primary: theme[2],
            border: theme[6],
            text: theme[11],
            notification: theme[9],
          },
          dark: true,
        }}
      >
        <JsStack
          screenOptions={{
            header: () => null,
            animationEnabled: !breakpoints.md,
            freezeOnBlur: true,
            detachPreviousScreen: false,
          }}
        >
          {["search", "customize", "share/index", "share/link"].map((t) => (
            <JsStack.Screen
              name={t}
              key={t}
              options={{
                presentation: breakpoints.md ? "transparentModal" : "modal",
                ...(!breakpoints.md && TransitionPresets.ModalPresentationIOS),
                cardStyle: {
                  backgroundColor: "transparent",
                  flex: 1,
                },
              }}
            />
          ))}
        </JsStack>
      </ThemeProvider>
    </ContentWrapper>
  );
}

