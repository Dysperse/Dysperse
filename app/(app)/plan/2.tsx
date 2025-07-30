import { Entity } from "@/components/collections/entity";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useSWR from "swr";
import { styles } from ".";
import { mutations } from "../[tab]/collections/mutations";

export const SubmitButton = ({ handleNext, disabled }) => {
  const theme = useColorTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingHorizontal: 20,
        marginTop: "auto",
        marginHorizontal: "auto",
        width: "100%",
      }}
    >
      <Button
        disabled={disabled}
        onPress={handleNext}
        backgroundColors={{
          default: theme[disabled ? 5 : 9],
          hovered: theme[10],
          pressed: theme[11],
        }}
        containerStyle={{
          width: "100%",
          marginTop: "auto",
          marginBottom: Math.max(insets.bottom, 20),
        }}
        height={70}
      >
        <ButtonText
          style={[styles.buttonText, { color: theme[disabled ? 8 : 1] }]}
          weight={900}
        >
          Continue
        </ButtonText>
        <Icon style={{ color: theme[disabled ? 8 : 1] }} bold>
          arrow_forward_ios
        </Icon>
      </Button>
    </View>
  );
};

const Header = () => {
  const theme = useColorTheme();

  return (
    <View
      style={{
        maxWidth: 700,
        width: "100%",
        marginHorizontal: "auto",
      }}
    >
      <Text
        style={{
          fontSize: 30,
          color: theme[11],
          marginTop: "auto",
          fontFamily: "serifText700",
        }}
      >
        Overdue tasks
      </Text>
      <Text
        style={{
          opacity: 0.6,
          color: theme[11],
          marginBottom: 10,
          marginTop: 5,
        }}
        weight={400}
      >
        Reschedule or complete them to clear this list.
      </Text>
    </View>
  );
};

export default function Page() {
  const breakpoints = useResponsiveBreakpoints();
  const theme = useColorTheme();

  const { data, mutate, error } = useSWR([
    "space/collections/collection",
    { all: "true", id: "??" },
  ]);

  const filteredTasks = (
    data?.entities && data?.labels
      ? [
          ...Object.values(data.entities),
          ...Object.values(data.labels).reduce(
            (acc: any[], curr: { entities: any[] }) => [
              ...acc,
              ...Object.values(curr.entities),
            ],
            []
          ),
        ].filter((t) => {
          return (
            !t.completionInstances.length &&
            !t.trash &&
            dayjs(t.start).isBefore(dayjs().startOf("day"))
          );
        })
      : []
  ).sort((a, b) => dayjs(a.start).diff(dayjs(b.start)));

  useEffect(() => {
    if (filteredTasks.length === 0) router.replace("/plan/3");
  }, [filteredTasks]);

  return (
    <LinearGradient colors={[theme[2], theme[3]]} style={{ flex: 1 }}>
      {error && <ErrorAlert />}
      <FlashList
        ListHeaderComponent={<Header />}
        contentContainerStyle={{
          padding: breakpoints.md ? 50 : 20,
          paddingTop: 0.1,
        }}
        centerContent
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        estimatedItemSize={108}
        renderItem={({ item }) => (
          <View
            style={{ maxWidth: 700, width: "100%", marginHorizontal: "auto" }}
          >
            <Entity
              showRelativeTime
              showLabel
              planMode
              isReadOnly={false}
              item={item}
              onTaskUpdate={mutations.categoryBased.update(mutate)}
            />
          </View>
        )}
      />
      <SubmitButton handleNext={() => router.push("/plan/3")} />
    </LinearGradient>
  );
}

