import { ContentWrapper } from "@/components/layout/content";
import Task from "@/components/task";
import CreateTask from "@/components/task/create";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Avatar } from "@/ui/Avatar";
import { Button, ButtonText } from "@/ui/Button";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { Menu } from "@/ui/Menu";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import { MasonryFlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import { createContext, useContext, useRef, useState } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import useSWR from "swr";

const StreamContext = createContext(null);
const useStreamContext = () => useContext(StreamContext);

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 100,
    paddingBottom: 20,
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
  selectButton: {
    height: 60,
  },
  selectButtonText: {
    fontSize: 20,
  },
});

function StreamList({ query, setQuery }) {
  const theme = useColorTheme();
  const { width } = useWindowDimensions();
  const { data, mutate } = useStreamContext();
  const breakpoints = useResponsiveBreakpoints();

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
    <View
      style={{
        flex: 1,
        maxWidth: width - 220,
        marginHorizontal: "auto",
        width: "100%",
      }}
    >
      <MasonryFlashList
        data={data}
        ListHeaderComponent={<Header query={query} setQuery={setQuery} />}
        numColumns={breakpoints.md ? 3 : 1}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item, columnIndex }) => (
          <View
            style={{
              padding: 10,
              ...(columnIndex === 0 && breakpoints.md && { paddingLeft: 100 }),
              ...(columnIndex === 2 && breakpoints.md && { paddingRight: 100 }),
              ...(!breakpoints.md && { paddingHorizontal: 20 }),
            }}
          >
            <Task
              openColumnMenu={() => {}}
              onTaskUpdate={onTaskUpdate}
              task={item}
            />
          </View>
        )}
        estimatedItemSize={200}
      />
    </View>
  );
}

function Header({ query, setQuery }) {
  const theme = useColorTheme();
  const menuRef = useRef(null);
  const { mutate } = useStreamContext();
  const handleClose = () => menuRef.current?.close();

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
          gap: 10,
          width: "100%",
          maxWidth: 500,
        }}
      >
        <TextField
          style={{
            fontFamily: "body_300",
            flex: 1,
            height: 60,
            borderWidth: 1,
            borderColor: theme[5],
            paddingHorizontal: 25,
            borderRadius: 99,
            fontSize: 20,
          }}
          placeholder="Search..."
          onChangeText={setQuery}
        />
        <Menu
          menuRef={menuRef}
          height={[550]}
          trigger={
            <Button variant="outlined" style={{ height: 60 }}>
              <Icon>filter_list</Icon>
              <ButtonText style={{ fontSize: 20 }}>Filter</ButtonText>
            </Button>
          }
        >
          <View style={{ paddingHorizontal: 20, gap: 10 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Text style={{ fontSize: 20 }} weight={800}>
                Filter...
              </Text>
              <IconButton variant="outlined" size={55} onPress={handleClose}>
                <Icon>close</Icon>
              </IconButton>
            </View>
            {[
              { name: "Completed?" },
              { name: "Pinned?" },
              { name: "Has due date?" },
              { name: "Past due date?" },
              { name: "Has label?" },
              { name: "Has notifications?" },
            ].map((button) => (
              <Button
                key={button.name}
                style={styles.selectButton}
                variant="outlined"
              >
                <ButtonText weight={700} style={styles.selectButtonText}>
                  {button.name}
                </ButtonText>
              </Button>
            ))}
          </View>
        </Menu>
        <CreateTask mutate={() => mutate()}>
          <IconButton variant="outlined" size={60}>
            <Icon>add</Icon>
          </IconButton>
        </CreateTask>
      </View>
    </LinearGradient>
  );
}

export default function Page() {
  const { data, isLoading, error, mutate } = useSWR([
    "space/all",
    { type: "TASK" },
  ]);

  const [query, setQuery] = useState("");

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
        <StreamContext.Provider
          value={{
            data: data?.filter((entity) =>
              entity?.name?.toLowerCase()?.includes(query.toLowerCase())
            ),
            mutate,
          }}
        >
          <StreamList query={query} setQuery={setQuery} />
        </StreamContext.Provider>
      )}
    </ContentWrapper>
  );
}
