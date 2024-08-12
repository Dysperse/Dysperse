import { Button, ButtonText } from "@/ui/Button";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import MenuPopover from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { useEffect, useRef } from "react";
import { AppState, Linking, Platform, Pressable, View } from "react-native";
import useSWR from "swr";
import { useFocusPanelContext } from "../../context";
import { widgetMenuStyles } from "../../widgetMenuStyles";

function formatNumber(num, d) {
  const formatter = Intl.NumberFormat("en", { notation: "compact" });
  return formatter.format(parseInt(num));
}

function StockChange({ subtle, number }: { subtle?: boolean; number: number }) {
  const red = useColor("red");
  const green = useColor("green");

  return (
    <Pressable
      style={{
        backgroundColor: subtle ? undefined : number > 0 ? green[9] : red[9],
        borderRadius: 5,
        width: 60,
        paddingRight: 5,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: subtle ? "flex-end" : "center",
      }}
    >
      <Icon
        style={{
          color: number > 0 ? green[subtle ? 9 : 5] : red[subtle ? 9 : 5],
        }}
      >
        {number > 0 ? "arrow_drop_up" : "arrow_drop_down"}
      </Icon>
      <Text
        variant="eyebrow"
        style={{
          fontSize: 11,
          textAlign: subtle ? "right" : "center",
          fontFamily: "mono",
          color: number > 0 ? green[subtle ? 9 : 5] : red[subtle ? 9 : 5],
          opacity: 1,
        }}
      >
        {number}%
      </Text>
    </Pressable>
  );
}

export function StockItem({
  large,
  stock,
  navigation,
}: {
  large?: boolean;
  stock: any;
  navigation;
}) {
  const theme = useColorTheme();
  const { panelState, setPanelState, collapseOnBack } = useFocusPanelContext();

  return (
    <Pressable
      key={stock.ticker}
      style={[
        {
          flexDirection: large || panelState === "COLLAPSED" ? "column" : "row",
          padding: 10,
          flex: 1,
          gap: 10,
          alignItems: large ? undefined : "center",
          borderBottomColor: theme[5],
          width: large ? "100%" : panelState === "COLLAPSED" ? 80 : 280,
        },
        large && {
          borderRadius: 20,
          marginBottom: 10,
          padding: 20,
          paddingVertical: 10,
          backgroundColor: theme[3],
        },
      ]}
      onPress={() => {
        if (panelState === "COLLAPSED") {
          navigation.push("Stocks");
          setPanelState("OPEN");
          if (panelState === "COLLAPSED") collapseOnBack.current = true;
        } else {
          Linking.openURL(
            `https://www.google.com/search?q=${stock.ticker}+stock`
          );
        }
      }}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", gap: 20, flex: 1 }}
      >
        {panelState !== "COLLAPSED" && (
          <Image
            source={{
              uri: `https://companiesmarketcap.com/img/company-logos/64/${stock.ticker.replace(
                "GOOGL",
                "GOOG"
              )}.webp`,
            }}
            style={{ width: 24, height: 24 }}
          />
        )}
        <View style={{ minWidth: 0, overflow: "hidden", flex: 1 }}>
          {large && (
            <ButtonText numberOfLines={1} weight={900}>
              {stock.name}
            </ButtonText>
          )}
          <ButtonText>{stock.ticker}</ButtonText>
        </View>
        {panelState !== "COLLAPSED" && (
          <ButtonText
            style={{ marginLeft: "auto", opacity: 0.6, flexShrink: 0 }}
          >
            ${formatNumber(stock.currentPrice, 1)}
          </ButtonText>
        )}
      </View>
      {large && (
        <Text style={{ color: theme[11], opacity: 0.5 }} weight={600}>
          Market cap: ${formatNumber(stock.marketCap, 2)}
        </Text>
      )}
      {large && (
        <Text
          style={{ color: theme[11], opacity: 0.5, marginTop: -7 }}
          weight={600}
        >
          Volume (24H): {formatNumber(stock.volume24h, 2)}
        </Text>
      )}
      {large && (
        <Text
          style={{ color: theme[11], opacity: 0.5, marginTop: -7 }}
          weight={600}
        >
          Previous Close: ${(stock.prev, 2)}
        </Text>
      )}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        {large ? (
          <View style={{ width: large ? "100%" : undefined }}>
            {["5min", "today", "week", "month", "year"].map((key) => (
              <View
                key={key}
                style={{
                  flexDirection: "row",
                  gap: 5,
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ fontSize: 12, color: theme[11], flex: 1 }}>
                  {capitalizeFirstLetter(key.replace("5", "5 "))}
                </Text>
                <StockChange subtle key={key} number={stock[key]} />
              </View>
            ))}
          </View>
        ) : (
          <StockChange number={stock.today} />
        )}
      </View>
    </Pressable>
  );
}

export default function Widget({ navigation, menuActions, widget }) {
  const theme = useColorTheme();
  const { panelState } = useFocusPanelContext();
  const listRef = useRef(null);

  const { data, error } = useSWR(
    "https://bubble-screener-api.neil-dahiya.workers.dev/api",
    (url) => fetch(url).then((res) => res.json())
  );

  const page = useRef(0);

  useEffect(() => {
    if (data) {
      listRef.current.scrollToIndex({
        index: 0,
        viewPosition: 0.5,
      });
    }
  }, [data]);

  useEffect(() => {
    //  Marquee effect for the list
    const interval = setInterval(() => {
      if (AppState.currentState !== "active") return;
      if (Platform.OS === "web" && !document.hasFocus()) return;
      if (listRef.current) {
        listRef.current.scrollToIndex({
          animated: true,
          index: page.current,
          viewPosition: 0.5,
        });
        page.current = (page.current + 1) % data.length;
        if (page.current === 0) {
          listRef.current.scrollToIndex({
            animated: false,
            index: page.current,
            viewPosition: 0.5,
          });
        }
      }
    }, 7000);
    return () => clearInterval(interval);
  }, [data, listRef]);

  return (
    <View>
      {panelState !== "COLLAPSED" && (
        <MenuPopover
          options={menuActions}
          trigger={
            <Button style={widgetMenuStyles.button} dense>
              <ButtonText weight={800} style={widgetMenuStyles.text}>
                Top stocks
              </ButtonText>
              <Icon style={{ color: theme[11] }}>expand_more</Icon>
            </Button>
          }
        />
      )}
      {error && <ErrorAlert />}
      <Pressable
        style={{
          backgroundColor: theme[3],
          borderRadius: 20,
        }}
      >
        <View
          style={{
            height: panelState === "COLLAPSED" ? 120 : 100,
            overflow: "hidden",
          }}
        >
          {Array.isArray(data) && (
            <FlashList
              horizontal
              ref={listRef}
              data={data
                .sort((a, b) => b.marketCap - a.marketCap)
                .reduce((acc, stock, i) => {
                  if (i % 2 === 0) {
                    acc.push([stock, data[i + 1]]);
                  }
                  return acc;
                }, [])}
              keyExtractor={(stock) => stock[0].ticker + stock[1].ticker}
              renderItem={({ item: stocks }: any) => (
                <View
                  style={{
                    flexDirection: "column",
                    padding: 10,
                    height: panelState === "COLLAPSED" ? 120 : 100,
                    gap: 10,
                  }}
                >
                  {stocks.map(
                    (stock) =>
                      stock && (
                        <StockItem
                          navigation={navigation}
                          key={stock.ticker}
                          stock={stock}
                        />
                      )
                  )}
                </View>
              )}
            />
          )}
        </View>
        {panelState !== "COLLAPSED" && (
          <View
            style={{
              padding: 10,
              paddingTop: 0,
            }}
          >
            <Button
              style={{ borderRadius: 0 }}
              variant="outlined"
              height={40}
              onPress={() => {
                navigation.navigate("Stocks");
              }}
            >
              <ButtonText>View more</ButtonText>
              <Icon>arrow_forward_ios</Icon>
            </Button>
          </View>
        )}
      </Pressable>
    </View>
  );
}
