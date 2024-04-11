import { Entity } from "@/components/collections/entity";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import { useColorTheme } from "@/ui/color/theme-provider";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import useSWR from "swr";
import { styles } from ".";

const SubmitButton = () => {
  const theme = useColorTheme();

  const handleNext = () => {
    router.push("/plan/3");
  };

  return (
    <Button
      onPress={handleNext}
      style={({ pressed, hovered }) => [
        styles.button,
        {
          backgroundColor: theme[pressed ? 11 : hovered ? 10 : 9],
          marginTop: "auto",
          marginHorizontal: "auto",
          marginBottom: 20,
        },
      ]}
    >
      <ButtonText style={[styles.buttonText, { color: theme[1] }]}>
        Next
      </ButtonText>
      <Icon style={{ color: theme[1] }} bold>
        arrow_forward_ios
      </Icon>
    </Button>
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
    Array.isArray(data?.entities) && Array.isArray(data?.labels)
      ? [
          ...data.entities,
          ...data.labels.reduce((acc, curr) => [...acc, ...curr.entities], []),
        ].filter((t) => {
          return (
            !t.completionInstances.length &&
            dayjs(t.due).isBefore(dayjs().startOf("day"))
          );
        })
      : []
  ).sort((a, b) => dayjs(a.due).diff(dayjs(b.due)));

  useEffect(() => {
    if (filteredTasks.length === 0) router.push("/plan/3");
  }, [filteredTasks]);

  return (
    <LinearGradient colors={[theme[2], theme[3]]} style={{ flex: 1 }}>
      {error && <ErrorAlert />}
      <FlashList
        ListHeaderComponent={() => (
          <View
            style={{
              maxWidth: 700,
              width: "100%",
              marginHorizontal: "auto",
            }}
          >
            <Text
              style={{ fontSize: 35, color: theme[11], marginTop: "auto" }}
              weight={900}
            >
              Overdue tasks
            </Text>
            <Text
              style={{
                fontSize: 20,
                opacity: 0.6,
                color: theme[11],
                marginBottom: 10,
              }}
            >
              Here are some tasks that you have missed the deadline for.
              Reschedule or mark them as complete to hide them from this list.
            </Text>
          </View>
        )}
        contentContainerStyle={{
          padding: breakpoints.md ? 50 : 20,
        }}
        centerContent
        data={filteredTasks}
        keyExtractor={(item) => item.id}
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
              onTaskUpdate={(newData) =>
                mutate(
                  (oldData) => {
                    const labelIndex = oldData.labels.findIndex(
                      (l) => l.id === newData.label?.id
                    );
                    if (labelIndex === -1)
                      return {
                        ...oldData,
                        entities: oldData.entities
                          .map((e) => (e.id === newData.id ? newData : e))
                          .filter((t) => !t.trash),
                      };
                    return {
                      ...oldData,
                      labels: oldData.labels
                        .map((l) =>
                          l.id === newData.label.id
                            ? {
                                ...l,
                                entities: l.entities.map((e) =>
                                  e.id === newData.id ? newData : e
                                ),
                              }
                            : l
                        )
                        .filter((t) => !t.trash),
                    };
                  },
                  { revalidate: false }
                )
              }
            />
          </View>
        )}
      />
      <SubmitButton />
    </LinearGradient>
  );
}
