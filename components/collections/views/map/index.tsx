import { mutations } from "@/app/(app)/[tab]/collections/mutations";
import CreateTask from "@/components/task/create";
import { useUser } from "@/context/useUser";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import { useColorTheme } from "@/ui/color/theme-provider";
import MenuPopover from "@/ui/MenuPopover";
import RefreshControl from "@/ui/RefreshControl";
import Text from "@/ui/Text";
import { FlashList } from "@shopify/flash-list";
import { Platform, View } from "react-native";
import { useCollectionContext } from "../../context";
import { ColumnEmptyComponent } from "../../emptyComponent";
import { Entity } from "../../entity";
import DomMapView from "./map";
import NativeMapView from "./NativeMap";

function TaskList() {
  const { data, mutate } = useCollectionContext();
  const breakpoints = useResponsiveBreakpoints();

  const tasks = (data || []).labels.reduce((acc, label) => {
    return [...acc, ...Object.values(label.entities || [])];
  }, []);

  return (
    <View style={{ height: "100%" }}>
      <View style={{ padding: 10, flexDirection: "row" }}>
        <MenuPopover
          trigger={
            <Button
              icon="expand_more"
              iconPosition="end"
              text="Tasks with location"
              variant="filled"
              containerStyle={{ padding: 10 }}
            />
          }
          options={[
            { icon: "done_all", text: "All", callback: () => {} },
            {
              icon: "location_on",
              text: "With location",
              callback: () => {},
            },
            {
              icon: "location_off",
              text: "Without location",
              callback: () => {},
            },
          ]}
        />
        <View style={{ flex: 1 }} />
      </View>
      <View style={{ paddingHorizontal: 10 }}>
        <CreateTask
          mutate={mutations.categoryBased.add(mutate)}
          defaultValues={{ collectionId: data.id, date: null }}
        >
          <Button
            variant="filled"
            containerStyle={{ flex: 1, zIndex: 99 }}
            large={!breakpoints.md}
            bold={!breakpoints.md}
            textStyle={breakpoints.md && { fontFamily: "body_400" }}
            iconPosition="end"
            text="Create"
            icon="stylus_note"
            height={breakpoints.md ? 50 : 55}
          />
        </CreateTask>
      </View>
      <View style={{ flex: 1, marginTop: 50 }}>
        <FlashList
          style={{ flex: 1 }}
          data={tasks}
          refreshControl={
            <RefreshControl refreshing={!data} onRefresh={() => mutate()} />
          }
          ListEmptyComponent={() => <ColumnEmptyComponent />}
          renderItem={({ item }) => (
            <Entity
              onTaskUpdate={mutations.categoryBased.update(mutate)}
              item={item}
              isReadOnly={false}
              showRelativeTime
            />
          )}
        />
      </View>
    </View>
  );
}

export default function MapView() {
  const theme = useColorTheme();
  const { session } = useUser();

  return (
    <View style={{ flex: 1, flexDirection: "row", padding: 10, gap: 10 }}>
      <View style={{ flex: 1, justifyContent: "center" }}>
        {!session.user.betaTester ? (
          <>
            <Text style={{ fontFamily: "serifText800", fontSize: 37 }}>
              Coming soon!
            </Text>
            <Text style={{ opacity: 0.8, marginTop: 10, fontSize: 17 }}>
              Soon, you'll be able to view your {"\n"}collection on a map. Stay
              tuned!
            </Text>
          </>
        ) : (
          <View>
            <TaskList />
          </View>
        )}
      </View>
      <View
        style={{
          flex: 2,
          borderRadius: 20,
          overflow: "hidden",
          backgroundColor: theme[3],
        }}
      >
        {Platform.OS === "web" ? <DomMapView /> : <NativeMapView />}
      </View>
    </View>
  );
}
