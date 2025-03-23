import { mutations } from "@/app/(app)/[tab]/collections/mutations";
import { IndeterminateProgressBar } from "@/components/IndeterminateProgressBar";
import CreateTask from "@/components/task/create";
import { TaskDrawer } from "@/components/task/drawer";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Avatar } from "@/ui/Avatar";
import BottomSheet from "@/ui/BottomSheet";
import { Button } from "@/ui/Button";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import ErrorAlert from "@/ui/Error";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import MenuPopover from "@/ui/MenuPopover";
import RefreshControl from "@/ui/RefreshControl";
import TextField from "@/ui/TextArea";
import { BottomSheetFlashList } from "@gorhom/bottom-sheet";
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

function Content({
  defaultQuery,
  closeOnSelect,
  inputRef,
  onLocationSelect,
  modalRef,
}) {
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
      console.log(res);
      setData(res);
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

  useImperativeHandle(inputRef, () => ({
    setValue: onChange,
  }));

  useEffect(() => {
    if (defaultQuery) {
      handleSearch(defaultQuery);
    }
  }, [defaultQuery]);

  return (
    <View style={{ padding: 10, height: "100%" }}>
      <View style={{ flex: 1, marginTop: -15, position: "relative" }}>
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
                  item.name && item.display_name.split(", ").slice(2).join(", ")
                }
              />
            </ListItemButton>
          )}
        />
      </View>
    </View>
  );
}

export function LocationPickerModal({
  children,
  onLocationSelect,
  hideSkip,
  closeOnSelect,
  defaultQuery,
  onClose,
  autoFocus,
}: {
  children: any;
  onLocationSelect: any;
  hideSkip?: boolean;
  closeOnSelect?: boolean;
  defaultQuery?: string;
  onClose?: () => void;
  autoFocus?: boolean;
}) {
  const modalRef = useRef(null);
  const inputRef = useRef(null);

  const trigger = cloneElement(children, {
    onPress: () => modalRef.current.present(),
  });

  return (
    <>
      {trigger}
      <BottomSheet sheetRef={modalRef} snapPoints={["90%"]} onClose={onClose}>
        <View
          style={{
            flexDirection: "row",
            marginBottom: 10,
            gap: 10,
            alignItems: "center",
            paddingHorizontal: 10,
          }}
        >
          <IconButton
            size={50}
            variant="filled"
            icon="close"
            onPress={() => modalRef.current.forceClose()}
          />

          <TextField
            placeholder="Find a location..."
            variant="filled"
            style={{
              height: 50,
              borderRadius: 999,
              paddingHorizontal: 25,
              flex: 1,
            }}
            weight={900}
            onChangeText={inputRef.current?.setValue}
            autoFocus={autoFocus}
          />
          {!hideSkip && (
            <Button
              containerStyle={{ marginLeft: "auto" }}
              text="Skip"
              onPress={() => onLocationSelect(null)}
              dense
              variant="filled"
              height={50}
              style={{ paddingHorizontal: 20 }}
            />
          )}
        </View>
        <Content
          inputRef={inputRef}
          defaultQuery={defaultQuery}
          closeOnSelect={closeOnSelect}
          onLocationSelect={onLocationSelect}
          modalRef={modalRef}
        />
      </BottomSheet>
    </>
  );
}

function CreateTaskButton({ mutate }) {
  const breakpoints = useResponsiveBreakpoints();
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
            paddingHorizontal: breakpoints.md ? 10 : 20,
            paddingTop: breakpoints.md ? undefined : 10,
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
      <View
        style={{ paddingHorizontal: breakpoints.md ? 10 : 20, zIndex: 999 }}
      >
        <CreateTaskButton mutate={mutations.categoryBased.add(mutate)} />
      </View>
      <View
        style={[
          { flex: 1, marginBottom: -10 },
          !breakpoints.md && {
            padding: 10,
            paddingBottom: 0,
            paddingTop: 0,
            paddingHorizontal: 20,
          },
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
        <BottomSheetFlashList
          keyboardShouldPersistTaps="handled"
          style={{ flex: 1 }}
          data={tasks}
          centerContent={tasks.length === 0}
          refreshControl={
            tasks.length === 0 ? undefined : (
              <RefreshControl refreshing={!data} onRefresh={() => mutate()} />
            )
          }
          ListEmptyComponent={() => (
            <View>
              <ColumnEmptyComponent />
            </View>
          )}
          contentContainerStyle={{
            paddingTop: breakpoints.md ? 20 : 10,
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

  const { locationMode } = useLocalSearchParams();

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
    locationMode === "location"
      ? tasksWithLocation
      : locationMode === "no-location"
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
          justifyContent: "flex-start",
          height: "100%",
        }}
      >
        <TaskList tasks={tasks} />
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
                flex.value === (breakpoints.md ? 2 : 4.5)
                  ? 0.3
                  : breakpoints.md
                  ? 2
                  : 4.5)
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

