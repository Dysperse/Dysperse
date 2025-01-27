import { Co2 } from "@/components/insights/Co2";
import { Header } from "@/components/insights/Header";
import { Heatmap } from "@/components/insights/Heatmap";
import { MemberSince } from "@/components/insights/MemberSince";
import { TasksCreated } from "@/components/insights/TasksCreated";
import ErrorAlert from "@/ui/Error";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useRef } from "react";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import useSWR from "swr";

export default function Page() {
  const { data, error } = useSWR(["user/insights"]);
  const ref = useRef<ScrollView>(null);

  return (
    <>
      <Header scrollRef={ref} />
      {data ? (
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{
              padding: 20,
              paddingTop: 50,
            }}
            ref={ref}
          >
            <View style={{ marginVertical: 50 }}>
              <Text
                style={{
                  fontSize: 40,
                  marginBottom: 10,
                  textAlign: "center",
                  fontFamily: "serifText800",
                }}
              >
                Insights
              </Text>
            </View>
            <View style={{ gap: 10 }}>
              <Co2 data={data} />
              <TasksCreated data={data} />
              <MemberSince />
              <Heatmap data={data} />
            </View>
          </ScrollView>
        </View>
      ) : (
        <View
          style={{ alignItems: "center", justifyContent: "center", flex: 1 }}
        >
          {error ? <ErrorAlert /> : <Spinner />}
        </View>
      )}
    </>
  );
}

