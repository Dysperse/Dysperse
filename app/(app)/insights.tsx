import { ProfileModal } from "@/components/ProfileModal";
import { Co2 } from "@/components/insights/Co2";
import { DayChart } from "@/components/insights/DayChart";
import { Header } from "@/components/insights/Header";
import { HourChart } from "@/components/insights/HourChart";
import { LabelChart } from "@/components/insights/LabelChart";
import { MemberSince } from "@/components/insights/MemberSince";
import { TasksCreated } from "@/components/insights/TasksCreated";
import { Activity } from "@/components/insights/activity";
import ContentWrapper from "@/components/layout/content";
import { useUser } from "@/context/useUser";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { ProfilePicture } from "@/ui/Avatar";
import ErrorAlert from "@/ui/Error";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { TouchableOpacity } from "@gorhom/bottom-sheet";
import { useRef } from "react";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import useSWR from "swr";

export default function Page() {
  const { data, error } = useSWR(["user/insights"]);
  const { session } = useUser();
  const breakpoints = useResponsiveBreakpoints();
  const ref = useRef<ScrollView>(null);

  return (
    <ContentWrapper noPaddingTop>
      <Header scrollRef={ref} />
      {data ? (
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{ padding: breakpoints.md ? 30 : 20 }}
            ref={ref}
          >
            <View style={{ marginVertical: 50 }}>
              <Text
                style={{
                  fontSize: 50,
                  marginBottom: 10,
                  textAlign: "center",
                }}
                weight={900}
              >
                Insights
              </Text>
              <ProfileModal email={session.user.email}>
                <TouchableOpacity
                  style={{ flexDirection: "row", justifyContent: "center" }}
                >
                  <ProfilePicture
                    name={session.user.profile.name}
                    image={session.user.profile.picture}
                    size={40}
                  />
                  <Text
                    style={{ fontSize: 23, marginLeft: 10, marginTop: 5 }}
                    weight={900}
                  >
                    {session.user.profile.name}
                  </Text>
                </TouchableOpacity>
              </ProfileModal>
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
            <Activity data={data} />
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
