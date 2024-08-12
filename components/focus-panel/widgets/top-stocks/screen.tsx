import { Button, ButtonText } from "@/ui/Button";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import MenuPopover from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { FlashList } from "@shopify/flash-list";
import { useState } from "react";
import { View } from "react-native";
import useSWR from "swr";
import { StockItem } from ".";

export default function TopStocksScreen() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("volume");
  const { data, error } = useSWR(
    "https://bubble-screener-api.neil-dahiya.workers.dev/api",
    (url) => fetch(url).then((res) => res.json())
  );

  const filterFunction = {
    gainers: (a: any, b: any) => b.today - a.today,
    losers: (a: any, b: any) => a.today - b.today,
    volume: (a: any, b: any) => b.volume - a.volume,
    marketCap: (a: any, b: any) => b.marketCap - a.marketCap,
    currentPrice: (a: any, b: any) => b.currentPrice - a.currentPrice,
  }[filter];

  const filters = [
    { text: "Top Gainers", value: "gainers" },
    { text: "Top Losers", value: "losers" },
    { text: "Market Volume", value: "volume" },
    { text: "Market Cap", value: "marketCap" },
    { text: "Current Price", value: "currentPrice" },
  ];

  const filteredData = data
    ? (
        data.filter((stock: any) => {
          if (!query) return true;
          return JSON.stringify(stock)
            .toLowerCase()
            .includes(query.toLowerCase());
        }) as any
      ).sort(filterFunction)
    : [];

  return (
    <View style={{ flex: 1 }}>
      {error && <ErrorAlert />}

      <View
        style={{
          padding: 16,
          paddingBottom: 10,
          gap: 10,
        }}
      >
        <TextField
          variant="filled+outlined"
          value={query}
          onChangeText={setQuery}
          placeholder="Search top US stocks..."
        />

        <MenuPopover
          trigger={
            <Button variant="filled">
              <ButtonText>
                Sort by:{" "}
                {filters.find((option) => option.value === filter)?.text}
              </ButtonText>
              <Icon>arrow_downward</Icon>
            </Button>
          }
          options={filters.map((option) => ({
            ...option,
            selected: option.value === filter,
            callback: () => setFilter(option.value),
          }))}
        />
      </View>
      {data && (
        <FlashList
          data={filteredData}
          centerContent={filteredData.length === 0}
          ListEmptyComponent={() => (
            <View
              style={{
                padding: 16,
                alignItems: "center",
                gap: 10,
                justifyContent: "center",
              }}
            >
              <Text style={{ textAlign: "center", fontSize: 25 }} weight={900}>
                We couldn't find any stocks matching your search criteria.
              </Text>
              <Text style={{ textAlign: "center" }}>
                This widget only shows the top 500 US stocks by market
              </Text>
            </View>
          )}
          contentContainerStyle={{ padding: 16, paddingTop: 0 }}
          renderItem={({ item }) => <StockItem large stock={item as any} />}
        />
      )}
    </View>
  );
}
