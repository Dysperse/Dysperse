import IconButton from "@/ui/IconButton";
import Modal from "@/ui/Modal";
import Text from "@/ui/Text";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import React, { cloneElement, useRef, useState } from "react";
import { InteractionManager, Keyboard, View } from "react-native";
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

export function TaskAttachmentButton({
  children,
  onClose,
  defaultView = "Add",
  lockView = false,
  menuRef,

  task,
  updateTask,
}: {
  children?: JSX.Element;
  onClose?: () => void;
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
        sheetRef={ref}
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

