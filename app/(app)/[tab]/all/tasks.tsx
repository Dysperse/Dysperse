import { ContentWrapper } from "@/components/layout/content";
import { Task } from "@/components/task";
import CreateTask from "@/components/task/create";
import Icon from "@/ui/Icon";
import { ListItemButton } from "@/ui/ListItemButton";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  View,
  useWindowDimensions,
} from "react-native";
import useSWR from "swr";

export default function Page() {
  const theme = useColorTheme();
  const { width } = useWindowDimensions();
  const { data } = useSWR(["space/all", { type: "TASK" }]);

  return (
    <ContentWrapper>
      <KeyboardAvoidingView>
        {data ? (
          <FlatList
            contentContainerStyle={{
              paddingBottom: 10,
            }}
            ListHeaderComponent={
              <>
                <Text
                  heading
                  style={{
                    fontSize: 45,
                    padding: 20,
                    paddingBottom: 0,
                    paddingTop: 40,
                  }}
                >
                  Tasks
                </Text>
                <View style={{ paddingHorizontal: 20 }}>
                  <TextField
                    placeholder="Find"
                    style={{
                      paddingHorizontal: 15,
                      paddingVertical: 7,
                      borderRadius: 15,
                      backgroundColor: theme[3],
                      marginBottom: 10,
                      marginTop: 5,
                    }}
                  />
                </View>
                <CreateTask>
                  <ListItemButton
                    style={{
                      borderRadius: width > 600 ? 20 : 0,
                      paddingVertical: 15 - (width > 600 ? 5 : 0),
                      paddingHorizontal: 20 - (width > 600 ? 5 : 0),
                    }}
                  >
                    <View
                      style={{
                        width: 25,
                        height: 25,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 99,
                        borderWidth: 2,
                        borderColor: theme[7],
                      }}
                    >
                      <Icon
                        size={20}
                        style={{
                          color: theme[8],
                          lineHeight: 22,
                        }}
                      >
                        add
                      </Icon>
                    </View>
                    <Text weight={400}>Create task</Text>
                  </ListItemButton>
                </CreateTask>
              </>
            }
            keyExtractor={(i) => i.id}
            data={data}
            renderItem={({ item }) => <Task task={item} />}
          />
        ) : (
          <View
            style={{
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ActivityIndicator />
          </View>
        )}
      </KeyboardAvoidingView>
    </ContentWrapper>
  );
}
