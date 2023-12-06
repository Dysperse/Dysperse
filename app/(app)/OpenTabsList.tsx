import React from "react";
import { Platform, Pressable, Text, View } from "react-native";
import type { ICarouselInstance } from "react-native-reanimated-carousel";
import Carousel from "react-native-reanimated-carousel";
import { window } from "../../constants";
import { useUser } from "../../context/useUser";
import Icon from "../../ui/icon";
import { styled } from "nativewind";

const PAGE_WIDTH = window.width;
const StyledPressable = styled(Pressable);

function Tab({ tab }) {
  return (
    <View
      style={{
        padding: 5,
        paddingHorizontal: 2.5,
        height: 64,
      }}
    >
      <StyledPressable
        className="flex-row items-center bg-gray-200 active:bg-gray-500"
        style={{
          flex: 1,
          gap: 20,
          width: PAGE_WIDTH * 0.7,
          borderRadius: 20,
          ...(Platform.OS === "web" && {
            maxWidth: 200,
          }),
        }}
      >
        <Icon className="select-none">{tab.tabData.icon}</Icon>
        <Text className="select-none">{tab.tabData.label}</Text>
      </StyledPressable>
    </View>
  );
}

export function OpenTabsList() {
  const { session } = useUser();
  const [data, setData] = React.useState([...new Array(6).keys()]);
  const [isFast, setIsFast] = React.useState(false);
  const [isAutoPlay, setIsAutoPlay] = React.useState(false);
  const [isPagingEnabled, setIsPagingEnabled] = React.useState(true);
  const ref = React.useRef<ICarouselInstance>(null);

  const baseOptions = {
    vertical: false,
    width: PAGE_WIDTH * 0.7,
    // height: PAGE_WIDTH / 2,
  } as const;

  return Platform.OS === "web" ? (
    <View>
      {session ? (
        session.user.tabs.map((tab) => <Tab tab={tab} key={tab.id} />)
      ) : (
        <Text>Loading...</Text>
      )}
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
        data={data}
        pagingEnabled={isPagingEnabled}
        onSnapToItem={(index) => console.log("current index:", index)}
        renderItem={({ index }) => (
          <View style={{ padding: 5, paddingHorizontal: 2.5 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: "red",
                width: PAGE_WIDTH * 0.7,
                borderRadius: 20,
              }}
            >
              <Text>Hi</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}
