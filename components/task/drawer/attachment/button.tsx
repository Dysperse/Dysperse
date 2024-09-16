import { IndeterminateProgressBar } from "@/components/IndeterminateProgressBar";
import { Avatar } from "@/ui/Avatar";
import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import { Modal } from "@/ui/Modal";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetModal, useBottomSheet } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import React, { cloneElement, useEffect, useRef, useState } from "react";
import { InteractionManager, Keyboard, View } from "react-native";
import { useDebounce } from "use-debounce";
import { TaskImagePicker } from "./TaskImagePicker";
import { AttachmentGrid } from "./grid";
import { TaskAttachmentPicker } from "./picker";
import { TaskAttachmentType } from "./type";

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

function LocationPicker({ task, updateTask }: { task: any; updateTask: any }) {
  const theme = useColorTheme();
  const inputRef = useRef(null);
  const { forceClose } = useBottomSheet();

  const [value, onChange] = useState("");
  const [debouncedValue] = useDebounce(value, 1000);

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

  useEffect(() => {
    if (debouncedValue) {
      handleSearch(debouncedValue);
    }
  }, [debouncedValue]);

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      inputRef.current?.focus({ preventScroll: true });
    });
  }, []);

  return (
    <View style={{ gap: 10 }}>
      <TextField
        bottomSheet
        inputRef={inputRef}
        variant="filled+outlined"
        blurOnSubmit={false}
        placeholder="Start typing to search..."
        onKeyPress={(e) => {
          if (e.nativeEvent.key === "Escape") {
            forceClose();
          }
        }}
        value={value}
        onChangeText={onChange}
        style={{
          paddingHorizontal: 25,
          paddingVertical: 15,
          fontSize: 20,
          marginTop: 10,
          borderRadius: 30,
        }}
        weight={900}
      />

      <View
        style={{
          flex: 1,
          borderRadius: 20,
          minHeight: 260,
          maxHeight: 260,
          overflow: "hidden",
          backgroundColor: theme[3],
        }}
      >
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            zIndex: 99,
          }}
        >
          {loading && <IndeterminateProgressBar height={3} />}
        </View>
        <FlashList
          data={data ? data.sort((a, b) => a.importance - b.importance) : []}
          ListEmptyComponent={() => (
            <View
              style={{
                padding: 20,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: theme[11],
                  opacity: 0.5,
                  fontSize: 20,
                }}
                weight={900}
              >
                No results found.
              </Text>
            </View>
          )}
          centerContent={!data || data.length === 0}
          renderItem={({ item }) => (
            <ListItemButton
              onPress={() => {
                updateTask("attachments", [
                  ...(task.attachments || []),
                  {
                    type: "LOCATION",
                    data: {
                      name: item.name || item.display_name,
                      rich: true,
                      lat: item.lat,
                      lon: item.lon,
                      full_name: item.display_name,
                    },
                  },
                ]);
                setTimeout(() => {
                  InteractionManager.runAfterInteractions(() => {
                    forceClose();
                  });
                }, 10);
              }}
            >
              <Avatar size={45} disabled>
                <Icon>
                  {icons[item.type] || icons[item.class] || "location_on"}
                </Icon>
              </Avatar>
              <ListItemText
                primary={item.name}
                secondary={item.display_name.replace(item.name + ", ", "")}
              />
            </ListItemButton>
          )}
        />
      </View>
      <Button
        variant="filled"
        height={60}
        onPress={() => {
          updateTask("attachments", [
            ...(task.attachments || []),
            {
              type: "LOCATION",
              data: value,
            },
          ]);
          if (value.trim() === "") return;
          setTimeout(() => {
            InteractionManager.runAfterInteractions(() => {
              forceClose();
            });
          }, 10);
        }}
      >
        <ButtonText weight={900}>Done</ButtonText>
        <Icon>check</Icon>
      </Button>
    </View>
  );
}

export function TaskAttachmentButton({
  children,
  onClose,
  onOpen,
  defaultView = "Add",
  lockView = false,
  menuRef,

  task,
  updateTask,
}: {
  children?: JSX.Element;
  onClose?: () => void;
  onOpen?: () => void;
  defaultView?: TaskAttachmentType;
  lockView?: boolean;
  menuRef?: React.MutableRefObject<BottomSheetModal>;
  task: any;
  updateTask: any;
}) {
  const _menuRef = useRef<BottomSheetModal>(null);
  const ref = menuRef || _menuRef;
  const [view, setView] = useState<TaskAttachmentType>(defaultView);

  const trigger = cloneElement(
    children || (
      <IconButton variant="outlined" size={50} icon="note_stack_add" />
    ),
    {
      onPress: () => {
        Keyboard.dismiss();
        InteractionManager.runAfterInteractions(() => {
          ref.current.present();
        });
      },
    }
  );

  return (
    <>
      {trigger}
      <Modal
        animation="SCALE"
        ref={ref}
        maxWidth={350}
        height={view === "Add" ? 357 : 500}
      >
        <View style={{ padding: 20, flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 20,
            }}
          >
            <IconButton
              onPress={() => {
                if (view === "Add" || lockView) {
                  ref.current.close();
                } else {
                  onClose?.();
                  setView("Add");
                }
              }}
              variant="outlined"
              size={55}
              icon={view === "Add" || lockView ? "close" : "arrow_back_ios_new"}
            />

            <Text weight={700} style={{ fontSize: 23 }}>
              {view}
            </Text>
          </View>
          {view === "Add" && (
            <AttachmentGrid
              task={task}
              updateTask={updateTask}
              menuRef={menuRef}
              setView={setView}
            />
          )}
          {view === "Location" && (
            <LocationPicker task={task} updateTask={updateTask} />
          )}
          {view === "Link" && (
            <TaskAttachmentPicker
              type="LINK"
              placeholder="Enter a link"
              task={task}
              updateTask={updateTask}
            />
          )}
          {view === "Image" && (
            <TaskImagePicker updateTask={updateTask} task={task} />
          )}
          {view === "Note" && (
            <TaskAttachmentPicker
              type="NOTE"
              multiline
              placeholder="Type in a note…"
              task={task}
              updateTask={updateTask}
            />
          )}
        </View>
      </Modal>
    </>
  );
}
