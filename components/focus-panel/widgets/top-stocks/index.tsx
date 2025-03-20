import { Button, ButtonText } from "@/ui/Button";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import MenuPopover from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { Linking, Pressable, View } from "react-native";
import Animated, {
  FadeInDown,
  FadeInRight,
  FadeOutLeft,
  FadeOutUp,
} from "react-native-reanimated";
import useSWR from "swr";

function StockChange({
  small,
  subtle,
  number,
}: {
  small?: boolean;
  subtle?: boolean;
  number: number;
}) {
  const red = useColor("red");
  const green = useColor("green");

  return (
    <View
      style={{
        backgroundColor: small ? undefined : number > 0 ? green[9] : red[9],
        borderRadius: 5,
        width: 60,
        paddingRight: 5,
        alignItems: "center",
        flexDirection: "row",
        height: small ? 10 : undefined,
        justifyContent: subtle ? "flex-end" : "center",
      }}
    >
      <Icon
        style={{
          color: number > 0 ? green[small ? 9 : 5] : red[small ? 9 : 5],
        }}
      >
        {number > 0 ? "arrow_drop_up" : "arrow_drop_down"}
      </Icon>
      <Text
        variant="eyebrow"
        style={{
          fontSize: 11,
          textAlign: small ? "right" : "center",
          fontFamily: "mono",
          color: number > 0 ? green[small ? 9 : 5] : red[small ? 9 : 5],
          opacity: 1,
        }}
      >
        {Math.abs(number)}%
      </Text>
    </View>
  );
}

export function StockItem({ small, stock }: { small?: boolean; stock: any }) {
  const Wrapper = small ? View : Pressable;

  return (
    <Wrapper
      key={stock.ticker}
      style={[
        {
          paddingVertical: small ? undefined : 20,
          flex: 1,
          paddingHorizontal: small ? undefined : 20,
          alignItems: "center",
        },
        small && {
          width: "100%",
          flexDirection: "row",
        },
      ]}
      onPress={
        small
          ? undefined
          : () => {
              Linking.openURL(
                `https://www.tradingview.com/symbols/${stock.ticker}`
              );
            }
      }
    >
      <Image
        source={{
          uri: `https://companiesmarketcap.com/img/company-logos/64/${stock.ticker.replace(
            "GOOGL",
            "GOOG"
          )}.webp`,
        }}
        style={{
          width: small ? 13 : 24,
          height: small ? 13 : 24,
          marginRight: small ? 10 : undefined,
          marginBottom: small ? undefined : 10,
        }}
      />
      <ButtonText
        weight={900}
        style={{
          fontSize: small ? 11 : undefined,
          lineHeight: small ? 11 : undefined,
        }}
      >
        {stock.ticker}
      </ButtonText>
      {!small && (
        <ButtonText numberOfLines={1} weight={200} style={{ fontSize: 12 }}>
          {stock.name}
        </ButtonText>
      )}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          marginLeft: small ? "auto" : undefined,
          marginTop: small ? undefined : 10,
        }}
      >
        <StockChange small={small} number={stock.today} />
      </View>
    </Wrapper>
  );
}

export default function Widget({ small, handlePin, navigation, widget }) {
  const theme = useColorTheme();
  const { data, error } = useSWR(
    "https://bubble-screener-api.neil-dahiya.workers.dev/api",
    (url) => fetch(url).then((res) => res.json())
  );

  const [currentPage, setCurrentPage] = useState(0);
  const PER_PAGE = 3;

  useEffect(() => {
    const interval = setInterval(
      () => {
        setCurrentPage((currentPage) => (currentPage + 1) % PER_PAGE);
      },
      small ? 10000 : 5000
    );
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return <ErrorAlert />;
  }

  return small ? (
    <View style={{ flex: 1, gap: 1 }}>
      {data &&
        data
          .slice(currentPage * PER_PAGE, currentPage * PER_PAGE + PER_PAGE)
          ?.map((stock) => (
            <Animated.View
              key={stock.ticker}
              entering={small ? FadeInDown : FadeInRight}
              exiting={small ? FadeOutUp : FadeOutLeft}
              style={{ flex: 1 }}
            >
              <StockItem
                small
                widget={widget}
                key={stock.ticker}
                stock={stock}
                navigation={navigation}
              />
            </Animated.View>
          ))}
    </View>
  ) : (
    <View>
      <MenuPopover
        menuProps={{
          style: { marginRight: "auto", marginLeft: -10 },
          rendererProps: { placement: "bottom" },
        }}
        containerStyle={{ width: 220, marginLeft: 20, marginTop: -15 }}
        options={[
          {
            text: widget.pinned ? "Pinned" : "Pin",
            icon: "push_pin",
            callback: handlePin,
            selected: widget.pinned,
          },
        ]}
        trigger={
          <Button
            dense
            textProps={{ variant: "eyebrow" }}
            text="Top stocks"
            icon="expand_more"
            iconPosition="end"
            containerStyle={{ marginBottom: 5 }}
            iconStyle={{ opacity: 0.6 }}
          />
        }
      />
      <Pressable
        style={{
          backgroundColor: theme[2],
          borderWidth: 1,
          borderColor: theme[5],
          borderRadius: 20,
        }}
      >
        <View
          style={{
            width: "100%",
            flexDirection: "row",
          }}
        >
          {data &&
            data
              .slice(currentPage * PER_PAGE, currentPage * PER_PAGE + PER_PAGE)
              ?.map((stock) => (
                <Animated.View
                  key={stock.ticker}
                  entering={FadeInRight}
                  exiting={FadeOutLeft}
                  style={{ flex: 1 }}
                >
                  <StockItem
                    widget={widget}
                    key={stock.ticker}
                    stock={stock}
                    navigation={navigation}
                  />
                </Animated.View>
              ))}
        </View>
      </Pressable>
    </View>
  );
}
