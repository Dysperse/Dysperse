import { cardStyles } from "@/components/insights/cardStyles";
import { useUser } from "@/context/useUser";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Emoji from "@/ui/Emoji";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import Logo from "@/ui/logo";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";

export function MemberSince() {
  const theme = useColorTheme();
  const { session } = useUser();
  const breakpoints = useResponsiveBreakpoints();

  return (
    <View
      style={[
        cardStyles.container,
        {
          backgroundColor: theme[3],
          borderColor: theme[5],
          marginBottom: 20,
          flexDirection: breakpoints.md ? "row" : "column",
          alignItems: "center",
          gap: 20,
          padding: 20,
        },
      ]}
    >
      <LinearGradient
        colors={[theme[2], theme[1]]}
        style={{
          borderWidth: 2,
          borderColor: theme[9],
          shadowColor: theme[11],
          shadowOffset: { width: 5, height: 5 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
          width: 100,
          height: 100,
          borderRadius: 99,
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <View
          style={{
            marginTop: -10,
            marginLeft: -13,
          }}
        >
          <Logo size={70} />
        </View>
        <LinearGradient
          colors={[theme[8], theme[9]]}
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 60,
            height: 155,
            marginBottom: -50,
            transform: [{ rotate: "45deg" }],
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontFamily: "serifText800",
              color: theme[2],
              marginLeft: -9,
              marginTop: -3,
              fontSize: 27,
              transform: [{ rotate: "-45deg" }],
            }}
          >
            &rsquo;{dayjs(session.user.createdAt).format("YY")}
          </Text>
        </LinearGradient>
      </LinearGradient>
      <Text
        style={{
          fontSize: 30,
          color: theme[11],
          textAlign: breakpoints.md ? "right" : "center",
        }}
        weight={200}
      >
        {capitalizeFirstLetter(session?.user?.profile?.name?.split(" ")?.[0])},
        you've been a member since{" "}
        {dayjs(session.user.createdAt).format("MMMM YYYY")} &mdash; thank you{" "}
        <Text
          style={{
            verticalAlign: "top",
          }}
        >
          <Emoji
            emoji="1F499"
            size={25}
            style={{
              transform: [{ translateY: -5 }],
            }}
          />
        </Text>
      </Text>
    </View>
  );
}
