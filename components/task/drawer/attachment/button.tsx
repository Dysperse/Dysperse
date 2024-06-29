import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { Menu } from "@/ui/Menu";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import React, { useRef, useState } from "react";
import { View } from "react-native";
import { TaskImagePicker } from "./TaskImagePicker";
import { AttachmentGrid } from "./grid";
import { TaskAttachmentPicker } from "./picker";
import { TaskAttachmentType } from "./type";

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
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const [view, setView] = useState<TaskAttachmentType>(defaultView);

  return (
    <Menu
      menuRef={ref}
      drawerProps={{
        enableContentPanningGesture: !breakpoints.md,
      }}
      height={[view === "Image" ? "60%" : view === "Link" ? 440 : 390]}
      onClose={() => {
        onClose?.();
        if (lockView) return;
        setView("Add");
      }}
      width={400}
      onOpen={onOpen}
      trigger={
        children || <IconButton variant="outlined" size={50} icon="edit" />
      }
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
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
        <TaskAttachmentPicker
          type="LOCATION"
          placeholder="Enter a location"
          handleParentClose={() => menuRef.current?.close()}
          task={task}
          updateTask={updateTask}
        />
      )}
      {view === "Link" && (
        <TaskAttachmentPicker
          type="LINK"
          placeholder="Enter a link"
          handleParentClose={() => menuRef.current?.close()}
          task={task}
          updateTask={updateTask}
          footer={
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                paddingHorizontal: 10,
              }}
            >
              <Icon>lightbulb</Icon>
              <Text>Supports YouTube, Canvas, Zoom, and more.</Text>
            </View>
          }
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
          handleParentClose={() => menuRef.current?.close()}
          task={task}
          updateTask={updateTask}
        />
      )}
    </Menu>
  );
}
