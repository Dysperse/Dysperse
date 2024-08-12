import ErrorAlert from "@/ui/Error";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { FlashList } from "@shopify/flash-list";
import { useState } from "react";
import { View } from "react-native";
import useSWR from "swr";
import { StockItem } from ".";

export default function TopStocksScreen() {
  const [query, setQuery] = useState("");
  const { data, error } = useSWR(
    "https://bubble-screener-api.neil-dahiya.workers.dev/api",
    (url) => fetch(url).then((res) => res.json())
  );

  const filteredData = data
    ? (data.filter((stock: any) => {
        if (!query) return true;
        return JSON.stringify(stock)
          .toLowerCase()
          .includes(query.toLowerCase());
      }) as any)
    : [];

  return (
    <View style={{ flex: 1 }}>
      {error && <ErrorAlert />}

      <View
        style={{
          padding: 16,
          paddingBottom: 10,
        }}
      >
        <TextField
          variant="filled+outlined"
          value={query}
          onChangeText={setQuery}
          placeholder="Search within the S&P 500 index..."
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
                This widget only shows stocks within the S&P 500 index.
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
