import { Co2 } from "@/components/insights/Co2";
import { DayChart } from "@/components/insights/DayChart";
import { Header } from "@/components/insights/Header";
import { Heatmap } from "@/components/insights/Heatmap";
import { HourChart } from "@/components/insights/HourChart";
import { LabelChart } from "@/components/insights/LabelChart";
import { MemberSince } from "@/components/insights/MemberSince";
import { TasksCreated } from "@/components/insights/TasksCreated";
import ContentWrapper from "@/components/layout/content";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import ErrorAlert from "@/ui/Error";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useRef } from "react";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import useSWR from "swr";

export default function Page() {
  const { data, error } = useSWR(["user/insights"]);
  const breakpoints = useResponsiveBreakpoints();
  const ref = useRef<ScrollView>(null);

  return (
    <ContentWrapper noPaddingTop>
      <Header scrollRef={ref} />
      {data ? (
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{
              padding: breakpoints.md ? 30 : 20,
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
            <View
              style={{
                flexDirection: breakpoints.md ? "row" : "column",
                marginBottom: 20,
                gap: 20,
              }}
            >
              <Co2 data={data} />
              <TasksCreated data={data} />
            </View>
            <MemberSince />
            <Heatmap data={data} />
            <LabelChart data={data} />
            <View
              style={{
                flexDirection: breakpoints.md ? "row" : "column",
                marginTop: 20,
                gap: 20,
              }}
            >
              <HourChart data={data} />
              <DayChart data={data} />
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
    </ContentWrapper>
  );
}

