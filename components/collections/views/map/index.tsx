import { mutations } from "@/app/(app)/[tab]/collections/mutations";
import { IndeterminateProgressBar } from "@/components/IndeterminateProgressBar";
import CreateTask from "@/components/task/create";
import { TaskDrawer } from "@/components/task/drawer";
import { useUser } from "@/context/useUser";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Avatar } from "@/ui/Avatar";
import { Button } from "@/ui/Button";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import ErrorAlert from "@/ui/Error";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import MenuPopover from "@/ui/MenuPopover";
import Modal from "@/ui/Modal";
import RefreshControl from "@/ui/RefreshControl";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { BottomSheetFlashList } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import {
  cloneElement,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Platform, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDebounce } from "use-debounce";
import { useCollectionContext } from "../../context";
import { ColumnEmptyComponent } from "../../emptyComponent";
import { Entity } from "../../entity";
import { taskSortAlgorithm } from "../skyline";
import MapPreview from "./MapView";

const icons = {
  dojo: "sports_mma",
  accountant: "account_balance",
  bank: "account_balance",
  house: "home",
  building: "home",
  office: "corporate_fare",
  shop: "shopping_bag",
  bakery: "cake",
  boundary: "outdoor_garden",
  waterway: "kayaking",
  construction: "construction",
  leisure: "nature_people",
  landuse: "landscape",
  natural: "forest",
  tourism: "tour",
  highway: "directions",
  railway: "train",
  bar: "local_bar",
  restaurant: "restaurant",
  university: "school",
  newspaper: "article",
  financial_advisor: "account_balance",
  travel_agency: "travel_explore",
  bicycle: "two_wheeler",
  school: "school",
  neighbourhood: "location_city",
  retail: "store",
  industrial: "engineering",
  fuel: "local_gas_station",
  hamlet: "location_city",
  village: "location_city",
  department_store: "store",
  cafe: "local_cafe",
  administrative: "location_city",
  commercial: "business",
  water: "water_drop",
  farmland: "agriculture",
  mall: "store",
  living_street: "directions",
  attraction: "tour",
  tertiary: "location_city",
  supermarket: "grocery",
  dam: "water_damage",
  parking: "local_parking",
  company: "business",
  pharmacy: "local_pharmacy",
  fabric: "local_laundry_service",
  hardware: "hardware",
  hostel: "hotel",
  furniture: "home",
  clinic: "local_hospital",
};

export function LocationPickerModal({
  children,
  onLocationSelect,
  hideSkip,
  closeOnSelect,
  defaultQuery,
}: {
  children: any;
  onLocationSelect: any;
  hideSkip?: boolean;
  closeOnSelect?: boolean;
  defaultQuery?: string;
}) {
  const modalRef = useRef(null);
  const trigger = cloneElement(children, {
    onPress: () => modalRef.current.present(),
  });

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async (query) => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&format=json`
      ).then((res) => res.json());

      setData(res);
      console.log(res);
    } catch (e) {
      console.error(e);
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  const [value, onChange] = useState("");
  const [debouncedValue] = useDebounce(value, 1000);
  useEffect(() => {
    if (debouncedValue) {
      handleSearch(debouncedValue);
    }
  }, [debouncedValue]);

  useEffect(() => {
    if (defaultQuery) {
      handleSearch(defaultQuery);
    }
  }, [defaultQuery]);

  return (
    <>
      {trigger}
      <Modal
        sheetRef={modalRef}
        animation="SCALE"
        innerStyles={{ padding: 20, gap: 15, paddingBottom: 0 }}
      >
        <View style={{ flexDirection: "row" }}>
          <Button
            text="Cancel"
            onPress={() => modalRef.current.forceClose()}
            dense
          />

          {!hideSkip && (
            <Button
              containerStyle={{ marginLeft: "auto" }}
              text="Skip location"
              onPress={() => onLocationSelect(null)}
              dense
            />
          )}
        </View>
        <TextField
          placeholder="Find a location..."
          variant="filled+outlined"
          style={{ height: 50, borderRadius: 999, paddingHorizontal: 25 }}
          weight={900}
          onChangeText={onChange}
        />
        <View style={{ height: 350, marginTop: -15, position: "relative" }}>
          {loading && (
            <View
              style={{
                position: "absolute",
                top: 10,
                width: "100%",
                height: 4,
                paddingHorizontal: 20,
              }}
            >
              <IndeterminateProgressBar height={4} />
            </View>
          )}
          {error && <ErrorAlert />}
          <BottomSheetFlashList
            contentContainerStyle={{ paddingTop: 10 }}
            data={data}
            renderItem={({ item }: any) => (
              <ListItemButton
                onPress={() => {
                  onLocationSelect(item);
                  if (closeOnSelect) modalRef.current.forceClose();
                }}
              >
                <Avatar icon={icons[item.type] || "location_on"} />
                <ListItemText
                  primary={item.name || item.display_name}
                  secondary={
                    item.name &&
                    item.display_name.split(", ").slice(2).join(", ")
                  }
                />
              </ListItemButton>
            )}
          />
        </View>
      </Modal>
    </>
  );
}

function CreateTaskButton({ mutate }) {
  const breakpoints = useResponsiveBreakpoints();
  const ref = useRef(null);
  const createTaskRef = useRef(null);

  return (
    <>
      <LocationPickerModal
        onLocationSelect={(location) => {
          createTaskRef.current.present();

          setTimeout(() => {
            if (location)
              createTaskRef.current.setValue("location", {
                placeId: location.place_id,
                name: location.display_name,
                coordinates: [location.lat, location.lon],
              });
          }, 100);
        }}
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
      </LocationPickerModal>
      <CreateTask ref={createTaskRef} mutate={mutate} />
    </>
  );
}

function TaskList({ tasks }) {
  const { data, mutate } = useCollectionContext();
  const breakpoints = useResponsiveBreakpoints();
  const theme = useColorTheme();

  const insets = useSafeAreaInsets();
  const { locationMode } = useLocalSearchParams();

  return (
    <>
      <View
        style={[
          {
            padding: 10,
            paddingTop: breakpoints.md ? undefined : 0,
            flexDirection: "row",
          },
        ]}
      >
        <MenuPopover
          trigger={
            <Button
              icon="expand_more"
              iconPosition="end"
              text={
                locationMode === "location"
                  ? "Tasks with location"
                  : locationMode === "no-location"
                  ? "Tasks without location"
                  : "All tasks"
              }
              variant="outlined"
            />
          }
          options={[
            {
              icon: "done_all",
              text: "All",
              callback: () => router.setParams({ locationMode: null }),
            },
            {
              icon: "location_on",
              text: "With location",
              callback: () => router.setParams({ locationMode: "location" }),
            },
            {
              icon: "location_off",
              text: "Without location",
              callback: () => router.setParams({ locationMode: "no-location" }),
            },
          ]}
        />
        <View style={{ flex: 1 }} />
      </View>
      <View style={{ paddingHorizontal: 10, zIndex: 999 }}>
        <CreateTaskButton mutate={mutations.categoryBased.add(mutate)} />
      </View>
      <View
        style={[
          { flex: 1, marginBottom: -10 },
          !breakpoints.md && { padding: 10, paddingBottom: 0 },
        ]}
      >
        <LinearGradient
          colors={[theme[1], addHslAlpha(theme[1], 0)]}
          style={{
            height: 50,
            marginBottom: -50,
            zIndex: 999,
            marginTop: Platform.OS === "web" ? 0 : 50,
          }}
        />
        <FlashList
          style={{ flex: 1 }}
          data={tasks}
          refreshControl={
            <RefreshControl refreshing={!data} onRefresh={() => mutate()} />
          }
          ListEmptyComponent={() => (
            <View style={{ paddingTop: 100 }}>
              <ColumnEmptyComponent />
            </View>
          )}
          contentContainerStyle={{
            paddingTop: 20,
            paddingBottom: insets.bottom + 10,
          }}
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
    </>
  );
}

const MapTaskDrawer = forwardRef((props: { mutate: any }, ref) => {
  const sheetRef = useRef(null);

  const [id, setId] = useState(null);

  useImperativeHandle(ref, () => ({
    open: (task) => {
      setId(task);
      setTimeout(() => sheetRef.current.show(), 200);
    },
  }));

  return (
    <TaskDrawer
      ref={sheetRef}
      mutateList={mutations.categoryBased.update(props.mutate)}
      id={id}
    />
  );
});

export default function MapView() {
  const theme = useColorTheme();
  const { session } = useUser();
  const breakpoints = useResponsiveBreakpoints();
  const { data, mutate } = useCollectionContext();

  const flex = useSharedValue(breakpoints.md ? 2 : 0.3);

  const animatedFlexStyle = useAnimatedStyle(() => ({
    flex: withSpring(flex.value, {
      damping: 50,
      stiffness: flex.value == 0.3 ? 100 : 20,
      mass: 1,
      overshootClamping: false,
    }),
  }));

  const { mode } = useLocalSearchParams();

  const tasksWithLocation = (data?.labels || [])
    .flatMap((label) =>
      Object.values(label.entities || []).filter((task: any) => !!task.location)
    )
    .concat(
      Object.values(data?.entities || []).filter((task: any) => !!task.location)
    );

  const tasksWithoutLocation = (data?.labels || [])
    .flatMap((label) =>
      Object.values(label.entities || []).filter((task: any) => !task.location)
    )
    .concat(
      Object.values(data?.entities || []).filter((task: any) => !task.location)
    );

  const tasks = taskSortAlgorithm(
    mode === "location"
      ? tasksWithLocation
      : mode === "no-location"
      ? tasksWithoutLocation
      : tasksWithLocation.concat(tasksWithoutLocation)
  );

  const mapTaskDrawerRef = useRef(null);

  return (
    <View
      style={{
        flex: 1,
        flexDirection: breakpoints.md ? "row" : "column-reverse",
        padding: breakpoints.md ? 10 : 0,
        paddingBottom: breakpoints.md ? 10 : 0,
        gap: 10,
      }}
    >
      <View
        style={{
          flex: 1,
          justifyContent: session.user.betaTester ? "flex-start" : "center",
          height: "100%",
        }}
      >
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
          <TaskList tasks={tasks} />
        )}
      </View>
      <Animated.View
        style={[
          animatedFlexStyle,
          {
            borderRadius: breakpoints.md ? 20 : 0,
            overflow: "hidden",
            backgroundColor: theme[3],
            position: "relative",
          },
        ]}
      >
        {!breakpoints.md && (
          <IconButton
            style={{ position: "absolute", top: 10, right: 10, zIndex: 999 }}
            icon="fullscreen"
            onPress={() =>
              (flex.value =
                flex.value === (breakpoints.md ? 2 : 5)
                  ? 0.3
                  : breakpoints.md
                  ? 2
                  : 5)
            }
          />
        )}
        <MapTaskDrawer mutate={mutate} ref={mapTaskDrawerRef} />
        <MapPreview
          tasks={tasksWithLocation}
          onLocationSelect={(task) => mapTaskDrawerRef.current.open(task)}
        />
      </Animated.View>
    </View>
  );
}

