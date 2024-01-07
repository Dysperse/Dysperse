import { ContentWrapper } from "@/components/layout/content";
import Task from "@/components/task";
import { Avatar } from "@/ui/Avatar";
import { Button, ButtonText } from "@/ui/Button";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import { MasonryFlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import { createContext, useContext } from "react";
import { StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import useSWR from "swr";

const StreamContext = createContext(null);
const useStreamContext = () => useContext(StreamContext);

const styles = StyleSheet.create({
  headerContainer: {
    paddingVertical: 100,
    alignItems: "center",
    gap: 10,
  },
  headerText: {
    fontSize: 50,
    textAlign: "center",
  },
  fallbackContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

function StreamList() {
  const theme = useColorTheme();
  const { data, mutate } = useStreamContext();

  const onTaskUpdate = (newTask) => {
    mutate(
      (oldData) => {
        if (oldData?.find((oldTask) => oldTask === newTask)) {
          return oldData;
        }
        return oldData
          .map((oldTask) =>
            oldTask?.id === newTask?.id
              ? newTask.trash === true
                ? undefined
                : newTask
              : oldTask
          )
          .filter((e) => e);
      },
      {
        revalidate: false,
      }
    );
  };

  return (
    <>
      <MasonryFlashList
        data={data}
        numColumns={2}
        renderItem={({ item }) => (
          <View style={{ backgroundColor: "red" }}>
            <Task onTaskUpdate={onTaskUpdate} task={item} />
          </View>
        )}
        estimatedItemSize={200}
      />
    </>
  );
}

function Header() {
  const theme = useColorTheme();
  return (
    <LinearGradient
      style={styles.headerContainer}
      colors={[theme[4], theme[1]]}
    >
      <Avatar
        size={70}
        style={{ borderRadius: 25 }}
        icon="check"
        iconProps={{ size: 40 }}
      />
      <Text style={styles.headerText} heading>
        Tasks
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          gap: 20,
        }}
      >
        <TextField
          style={{
            flex: 1,
            height: 60,
            borderWidth: 1,
            borderColor: theme[5],
            paddingHorizontal: 25,
            borderRadius: 99,
          }}
          placeholder="Search..."
        />
        <Button variant="outlined" style={{ height: 60 }}>
          <Icon>filter_list</Icon>
          <ButtonText>Filter</ButtonText>
        </Button>
      </View>
    </LinearGradient>
  );
}

export default function Page() {
  const { data, isLoading, error, mutate } = useSWR([
    "space/all",
    { type: "TASK" },
  ]);

  return (
    <ContentWrapper noPaddingTop>
      {isLoading ? (
        <View style={styles.fallbackContainer}>
          <Spinner />
        </View>
      ) : error ? (
        <View style={styles.fallbackContainer}>
          <ErrorAlert />
        </View>
      ) : (
        <ScrollView>
          <Header />
          <StreamContext.Provider value={{ data, mutate }}>
            <StreamList />
          </StreamContext.Provider>
        </ScrollView>
      )}
    </ContentWrapper>
  );
}
