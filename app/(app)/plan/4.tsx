import { createTab } from "@/components/layout/openTab";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect } from "react";
import { styles } from ".";

const SubmitButton = () => {
  const theme = useColorTheme();

  const handleNext = () => router.replace("/");

  return (
    <Button
      onPress={handleNext}
      style={({ pressed, hovered }) => [
        {
          backgroundColor: theme[pressed ? 11 : hovered ? 10 : 9],
        },
      ]}
      containerStyle={{
        marginTop: 10,
        marginBottom: 20,
        width: "100%",
      }}
      height={70}
    >
      <ButtonText style={[styles.buttonText, { color: theme[1] }]}>
        Done
      </ButtonText>
      <Icon style={{ color: theme[1] }} bold>
        check
      </Icon>
    </Button>
  );
};

const PlannerButton = () => {
  const { sessionToken } = useUser();
  const handleNext = () => {
    createTab(sessionToken, {
      slug: "/[tab]/collections/[id]/[type]",
      icon: "transition_slide",
      params: { type: "planner", id: "all" },
    });
    router.replace("/");
  };

  return (
    <Button
      onPress={handleNext}
      height={40}
      style={[styles.button]}
      containerStyle={{
        marginTop: "auto",
        marginHorizontal: "auto",
        width: "100%",
      }}
    >
      <ButtonText>Open planner</ButtonText>
      <Icon bold>north_east</Icon>
    </Button>
  );
};

export default function Page() {
  const breakpoints = useResponsiveBreakpoints();
  const { sessionToken } = useUser();
  const theme = useColorTheme();

  useEffect(() => {
    sendApiRequest(
      sessionToken,
      "PUT",
      "user/profile",
      {},
      {
        body: JSON.stringify({
          lastPlanned: new Date().toISOString(),
        }),
      }
    );
  });

  return (
    <LinearGradient
      colors={[theme[2], theme[3]]}
      style={{ flex: 1, alignItems: "center", padding: 20 }}
    >
      <Text
        style={{
          fontSize: 40,
          color: theme[11],
          marginTop: "auto",
          textAlign: "center",
          paddingTop: 40,
          fontFamily: "serifText800",
        }}
      >
        You're all set!
      </Text>
      <Text
        weight={300}
        style={{
          textAlign: "center",
          fontSize: 20,
          opacity: 0.6,
          color: theme[11],
          marginBottom: 10,
        }}
      >
        Conquer your day with confidence.{"\n"}You've got this!
      </Text>
      <PlannerButton />
      <SubmitButton />
    </LinearGradient>
  );
}

