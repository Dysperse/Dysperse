import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import type { ICarouselInstance } from "react-native-reanimated-carousel";
import Carousel from "react-native-reanimated-carousel";
import { window } from "../../constants";
import { useUser } from "../../context/useUser";
import Icon from "../../ui/icon";
import { styled } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";
import { redDark } from "../../themes";
import { useColor } from "../../ui/color";

const PAGE_WIDTH = window.width;
const StyledPressable = styled(Pressable);

function Tab({ tab }) {
  const isPerspective = useMemo(
    () => tab.tabData.href.includes("perspectives"),
    [tab.tabData]
  );

  const redPalette = useColor("red", false);

  const colors = isPerspective ? redPalette : redPalette;

  return (
    <View
      style={{
        padding: 6,
        paddingHorizontal: 3,
        flex: 1,
        width: PAGE_WIDTH * 0.8,
      }}
    >
      <Pressable
        onPress={() => alert(JSON.stringify(tab))}
        style={{
          flex: 1,
          paddingHorizontal: 15,
          columnGap: 15,
          borderRadius: 20,
          alignItems: "center",
          flexDirection: "row",
          backgroundColor: "#ddd",
        }}
        className="active:opacity-60"
      >
        <LinearGradient
          colors={[colors[5], colors[7]]}
          // 45deg
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 14,
            width: 35,
            height: 35,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={32} style={{ color: colors[11] }}>
            {tab.tabData.icon}
          </Icon>
        </LinearGradient>
        <Text>{tab.tabData.label}</Text>
      </Pressable>
    </View>
  );
}

export function OpenTabsList() {
  const { session } = useUser();
  const [data] = React.useState([...new Array(6).keys()]);
  const [isFast, setIsFast] = React.useState(false);
  const [isAutoPlay, setIsAutoPlay] = React.useState(false);
  const [isPagingEnabled, setIsPagingEnabled] = React.useState(true);
  const ref = React.useRef<ICarouselInstance>(null);

  const baseOptions = {
    vertical: false,
    width: PAGE_WIDTH * 0.8,
  } as const;

  return session ? (
    Platform.OS === "web" ? (
      <View>
        {session.user.tabs.map((tab) => (
          <Tab tab={tab} key={tab.id} />
        ))}
      </View>
    ) : (
      <View style={{ flex: 1 }}>
        <Carousel
          {...baseOptions}
          loop={false}
          ref={ref}
          style={{
            width: "100%",
            justifyContent: "center",
            height: 64,
          }}
          autoPlay={isAutoPlay}
          autoPlayInterval={isFast ? 100 : 2000}
          data={session.user.tabs}
          pagingEnabled={isPagingEnabled}
          onSnapToItem={(index) => console.log("current index:", index)}
          renderItem={({ index }) => (
            <Tab
              tab={session.user.tabs[index]}
              key={session.user.tabs[index].id}
            />
          )}
        />
      </View>
    )
  ) : (
    <View>
      <ActivityIndicator />
    </View>
  );
}
