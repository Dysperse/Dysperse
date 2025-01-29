import { Button } from "@/ui/Button";
import ErrorAlert from "@/ui/Error";
import MenuPopover from "@/ui/MenuPopover";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useState } from "react";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import useSWR from "swr";
import { MenuButton } from "./home";

function YearSelector({ years, year, setYear }) {
  return (
    <MenuPopover
      trigger={<Button style={{ marginTop: 20 }} />}
      options={years.map((y) => ({
        text: y.toString(),
        selected: y === year,
        callback: () => setYear(y),
      }))}
    />
  );
}

function Insights({ year }) {
  const { data, error } = useSWR(["user/insights", { year }]);

  return data ? (
    <Text>{JSON.stringify(data, null, 2)}</Text>
  ) : (
    <View>{error ? <ErrorAlert /> : <Spinner />}</View>
  );
}

export default function Page() {
  const { data, error } = useSWR(["user/insights/years"]);
  const [year, setYear] = useState(new Date().getFullYear());

  return data ? (
    <ScrollView contentContainerStyle={{ paddingVertical: 50 }}>
      <MenuButton gradient addInsets back />
      <Text
        style={{
          fontFamily: "serifText700",
          fontSize: 30,
          textAlign: "center",
          marginTop: 50,
        }}
      >
        Insights
      </Text>
      {data.years.length > 0 && (
        <YearSelector years={data.years} year={year} setYear={setYear} />
      )}

      <Insights year={year} />
    </ScrollView>
  ) : (
    <View style={{ height: "100%", width: "100%" }}>
      <MenuButton gradient addInsets back />
      <View
        style={{
          height: "100%",
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {error ? <ErrorAlert /> : <Spinner />}
      </View>
    </View>
  );
}

