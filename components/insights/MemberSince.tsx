import { useUser } from "@/context/useUser";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
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
        {
          backgroundColor: theme[4],
          borderColor: theme[5],
          borderRadius: 20,
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
          colors={[theme[9], theme[11]]}
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
          <View style={{ transform: [{ rotate: "-45deg" }] }}>
            <Text
              style={{
                fontFamily: "serifText800",
                color: theme[2],
                marginLeft: -9,
                marginTop: -3,
                fontSize: 27,
              }}
            >
              &rsquo;{dayjs(session.user.createdAt).format("YY")}
            </Text>
          </View>
        </LinearGradient>
      </LinearGradient>
      <Text
        style={{
          fontSize: 20,
          color: theme[11],
          textAlign: breakpoints.md ? "left" : "center",
          maxWidth: 280,
        }}
        weight={700}
      >
        {capitalizeFirstLetter(session?.user?.profile?.name?.split(" ")?.[0])}
        {session?.user?.profile?.name?.split ? ", y" : " Y"}ou've been a user
        since {dayjs(session.user.createdAt).format("MMMM YYYY")} &mdash; thank
        you!
      </Text>
    </View>
  );
}

