import { mutations } from "@/app/(app)/[tab]/collections/mutations";
import { useUser } from "@/context/useUser";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
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
import { cloneElement, useEffect, useRef, useState } from "react";
import { Platform, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useDebounce } from "use-debounce";
import { useCollectionContext } from "../../context";
import { ColumnEmptyComponent } from "../../emptyComponent";
import { Entity } from "../../entity";
import DomMapView from "./map";
import NativeMapView from "./NativeMap";

function LocationPickerModal({ children, onLocationSelect }) {
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

  return (
    <>
      {trigger}
      <Modal
        sheetRef={modalRef}
        animation="SCALE"
        innerStyles={{ padding: 20, gap: 15 }}
      >
        <View style={{ flexDirection: "row" }}>
          <Button
            text="Cancel"
            onPress={() => modalRef.current.forceClose()}
            dense
          />
        </View>
        <TextField
          placeholder="Find a location..."
          variant="filled+outlined"
          style={{ height: 50, borderRadius: 999, paddingHorizontal: 25 }}
          weight={900}
          onChangeText={onChange}
        />
        <View style={{ height: 300 }}>
          <BottomSheetFlashList
            data={data}
            renderItem={({ item }) => (
              <ListItemButton>
                <ListItemText
                  primary={item.display_name || item.name}
                  secondary={item.type || item.class}
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
  const locationRef = useRef(null);

  return (
    <LocationPickerModal onLocationSelect={(location) => {}}>
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
  );
}

function TaskList() {
  const { data, mutate } = useCollectionContext();
  const breakpoints = useResponsiveBreakpoints();
  const theme = useColorTheme();

  const tasks = (data || []).labels.reduce((acc, label) => {
    return [...acc, ...Object.values(label.entities || [])];
  }, []);

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
      <View style={{ paddingHorizontal: 10, zIndex: 999 }}>
        <CreateTaskButton mutate={mutate} />
      </View>
      <View
        style={[
          { flex: 1 },
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
    </>
  );
}

export default function MapView() {
  const theme = useColorTheme();
  const { session } = useUser();
  const breakpoints = useResponsiveBreakpoints();

  const flex = useSharedValue(breakpoints.md ? 2 : 0.3);

  const animatedFlexStyle = useAnimatedStyle(() => ({
    flex: withSpring(flex.value, {
      damping: 50,
      stiffness: flex.value == 0.3 ? 100 : 20,
      mass: 1,
      overshootClamping: false,
    }),
  }));

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
          <TaskList />
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
        {Platform.OS === "web" ? <DomMapView /> : <NativeMapView />}
      </Animated.View>
    </View>
  );
}

