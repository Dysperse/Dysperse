import { Entity } from "@/components/collections/entity";
import { taskInputStyles } from "@/components/signup/TaskCreator";
import CreateTask from "@/components/task/create";
import { Button, ButtonText } from "@/ui/Button";
import { useColorTheme } from "@/ui/color/theme-provider";
import Icon from "@/ui/Icon";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Pressable, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import useSWR from "swr";
import { styles } from ".";

const SubmitButton = ({ todaysTasks }) => {
  const theme = useColorTheme();

  const disabled = todaysTasks?.length < 3;

  const handleNext = () => {
    router.push("/plan/3");
  };

  return (
    <Button
      onPress={handleNext}
      disabled={disabled}
      style={({ pressed, hovered }) => [
        styles.button,
        {
          backgroundColor: !disabled
            ? theme[pressed ? 11 : hovered ? 10 : 9]
            : theme[7],
          marginTop: "auto",
        },
      ]}
    >
      <ButtonText
        style={[styles.buttonText, { color: theme[!disabled ? 1 : 10] }]}
      >
        Next
      </ButtonText>
      <Icon style={{ color: theme[!disabled ? 1 : 10] }} bold>
        east
      </Icon>
    </Button>
  );
};

function TodaysTasks({ data, mutate, error }) {
  return (
    <View>
      {Array.isArray(data) ? (
        data
          .find((d) => dayjs().isBetween(dayjs(d.start), dayjs(d.end)))
          .tasks.map(
            (e) =>
              e?.id && (
                <Entity
                  planMode
                  isReadOnly={false}
                  key={e.id}
                  item={e}
                  onTaskUpdate={(newTask) =>
                    mutate(
                      (oldData) => {
                        const day = oldData.find((d) =>
                          dayjs().isBetween(dayjs(d.start), dayjs(d.end))
                        );
                        return oldData.map((d) =>
                          d.id === day.id
                            ? {
                                ...d,
                                tasks: d.tasks
                                  .map((t) =>
                                    t.id === newTask.id ? newTask : t
                                  )
                                  .filter((t) => !t.trash),
                              }
                            : d
                        );
                      },
                      { revalidate: false }
                    )
                  }
                  showLabel
                />
              )
          )
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: 200,
          }}
        >
          <Spinner />
        </View>
      )}
    </View>
  );
}

export default function Page() {
  const theme = useColorTheme();

  const { data, mutate, error } = useSWR([
    "space/collections/collection/planner",
    {
      start: dayjs().startOf("week").utc().toISOString(),
      end: dayjs().endOf("week").utc().toISOString(),
      type: "week",
      timezone: dayjs.tz.guess(),
      all: "true",
      id: "everything",
    },
  ]);

  const todaysTasks = data?.find((d) =>
    dayjs().isBetween(dayjs(d.start), dayjs(d.end))
  ).tasks;

  return (
    <LinearGradient colors={[theme[1], theme[2], theme[3]]} style={{ flex: 1 }}>
      <ScrollView
        centerContent
        contentContainerStyle={{
          padding: 50,
          maxWidth: 700,
          width: "100%",
          marginHorizontal: "auto",
        }}
      >
        <Text
          style={{ fontSize: 35, color: theme[11], marginTop: "auto" }}
          weight={900}
        >
          {todaysTasks?.length < 3
            ? "What's your plan?"
            : "Let's review your day."}
        </Text>
        <Text
          style={{
            fontSize: 20,
            opacity: 0.6,
            color: theme[11],
            marginBottom: 10,
          }}
        >
          {todaysTasks?.length < 3
            ? "Create at least 3 tasks you'd want to focus on for today."
            : "Here are your tasks for today. Edit them if you want."}
        </Text>
        <TodaysTasks data={data} mutate={mutate} error={error} />
        <CreateTask
          mutate={(newTask) => {
            if (!newTask) return;
            mutate(
              (oldData) => {
                const day = oldData.find((d) =>
                  dayjs().isBetween(dayjs(d.start), dayjs(d.end))
                );
                return oldData.map((d) =>
                  d.id === day.id
                    ? {
                        ...d,
                        tasks: [...d.tasks, newTask],
                      }
                    : d
                );
              },
              { revalidate: false }
            );
          }}
          defaultValues={{ date: dayjs() }}
        >
          <Pressable
            style={({ pressed, hovered }) => [
              taskInputStyles.container,
              {
                backgroundColor: theme[pressed ? 6 : hovered ? 5 : 4],
                borderColor: theme[pressed ? 6 : hovered ? 5 : 4],
                marginBottom: 20,
                paddingLeft: 3,
                alignItems: "center",
              },
            ]}
          >
            <View
              style={[
                taskInputStyles.check,
                {
                  borderColor: "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                },
              ]}
            >
              <Icon
                size={30}
                style={{
                  color: theme[10],
                }}
              >
                add
              </Icon>
            </View>
            <Text
              weight={700}
              style={{ marginLeft: -10, opacity: 0.8, color: theme[11] }}
            >
              New task...
            </Text>
          </Pressable>
        </CreateTask>
        <SubmitButton todaysTasks={todaysTasks} />
      </ScrollView>
    </LinearGradient>
  );
}
