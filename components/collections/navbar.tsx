import { useSidebarContext } from "@/components/layout/sidebar/context";
import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import BottomSheet from "@/ui/BottomSheet";
import { Button, ButtonText } from "@/ui/Button";
import Calendar from "@/ui/Calendar";
import ConfirmationModal from "@/ui/ConfirmationModal";
import Emoji from "@/ui/Emoji";
import { EmojiPicker } from "@/ui/EmojiPicker";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { Menu } from "@/ui/Menu";
import MenuPopover, { MenuItem } from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import dayjs, { ManipulateType } from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import {
  router,
  useGlobalSearchParams,
  useLocalSearchParams,
} from "expo-router";
import { ReactElement, memo, useCallback, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import LabelPicker from "../labels/picker";
import { CollectionContext, useCollectionContext } from "./context";

const styles = StyleSheet.create({
  navbarIconButton: {
    flexDirection: "row",
    height: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 50,
    borderRadius: 20,
  },
});

function AgendaCalendarButton() {
  const { start }: any = useGlobalSearchParams();

  const titleFormat = {
    week: "[Week #]W • MMM YYYY",
    month: "YYYY",
    year: "YYYY",
  }["week"];

  return (
    <MenuPopover
      containerStyle={{ width: 300, marginTop: 10 }}
      trigger={
        <Button>
          <Text numberOfLines={1} weight={600}>
            {dayjs(start).format(titleFormat).split("•")?.[0]}
          </Text>
          <Text numberOfLines={1} style={{ opacity: 0.6 }}>
            {dayjs(start).format(titleFormat).split("• ")?.[1]}
          </Text>
        </Button>
      }
    >
      <Calendar
        onDayPress={(day) => {
          router.setParams({
            start: dayjs(day.dateString).format("YYYY-MM-DD"),
          });
        }}
        markedDates={{
          [dayjs(start).format("YYYY-MM-DD")]: {
            selected: true,
            disableTouchEvent: true,
          },
        }}
      />
    </MenuPopover>
  );
}

function AgendaNavbarButtons() {
  const theme = useColorTheme();
  // eslint-disable-next-line prefer-const
  let { agendaView, start }: any = useGlobalSearchParams();
  if (!agendaView) agendaView = "week";

  const handlePrev = useCallback(async () => {
    const newParams = {
      start: dayjs(start)
        .subtract(1, agendaView as ManipulateType)
        .format("YYYY-MM-DD"),
    };
    router.setParams(newParams);
  }, [agendaView, start]);

  const handleNext = useCallback(() => {
    router.setParams({
      start: dayjs(start)
        .startOf(agendaView as ManipulateType)
        .add(1, agendaView as ManipulateType)
        .format("YYYY-MM-DD"),
    });
  }, [agendaView, start]);

  const handleToday = useCallback(() => {
    router.setParams({
      start: dayjs().format("YYYY-MM-DD"),
    });
  }, []);

  const isTodaysView = dayjs().isBetween(
    dayjs(start).startOf(agendaView as ManipulateType),
    dayjs(start).endOf(agendaView as ManipulateType),
    "day",
    "[]"
  );
  const breakpoints = useResponsiveBreakpoints();

  return (
    <View
      style={[
        !breakpoints.md && {
          backgroundColor: theme[3],
          paddingHorizontal: 15,
          borderTopColor: theme[6],
          borderTopWidth: 1,
        },
        {
          flexDirection: "row",
          gap: 10,
        },
      ]}
    >
      <View
        style={[
          {
            flexDirection: "row",
            justifyContent: "space-between",
            height: 50,
            alignItems: "center",
            paddingHorizontal: 10,
          },
          breakpoints.md
            ? {
                marginRight: !isTodaysView ? undefined : "auto",
                borderWidth: 1,
                borderRadius: 20,
                borderColor: theme[6],
              }
            : { flex: 1 },
        ]}
      >
        <IconButton onPress={handlePrev}>
          <Icon>west</Icon>
        </IconButton>
        <AgendaCalendarButton />
        <IconButton onPress={handleNext}>
          <Icon>east</Icon>
        </IconButton>
      </View>

      {!isTodaysView && (
        <View
          style={[
            {
              marginRight: "auto",
              flexDirection: "row",
              height: 50,
              borderRadius: 20,
              alignItems: "center",
              paddingHorizontal: 10,
            },
            breakpoints.md && {
              borderWidth: 1,
              borderColor: theme[6],
            },
          ]}
        >
          <IconButton onPress={handleToday}>
            <Icon>today</Icon>
          </IconButton>
        </View>
      )}
    </View>
  );
}

const CollectionLabelMenu = memo(function CollectionLabelMenu() {
  const { data, mutate } = useCollectionContext();
  const { session } = useSession();
  const [labels, setLabels] = useState(data?.labels?.map((i) => i.id) || []);

  const handleSave = async () => {
    try {
      if (labels === data.labels.map((i) => i.id)) return;
      await sendApiRequest(
        session,
        "PUT",
        "space/collections",
        {},
        {
          body: JSON.stringify({ labels, id: data.id, gridOrder: labels }),
        }
      );
      await mutate();
      Toast.show({ type: "success", text1: "Saved!" });
    } catch (e) {
      Toast.show({ type: "error", text1: "Something went wrong" });
    }
  };

  return (
    <LabelPicker
      multiple
      hideBack
      sheetProps={
        {
          // enablePanDownToClose: false,
          // disableBackToClose: true,
          // disableEscapeToClose: true,
          // disableBackdropPressToClose: true,
        }
      }
      autoFocus={false}
      label={labels}
      setLabel={setLabels}
      onClose={handleSave}
    >
      <MenuItem>
        <Icon>label</Icon>
        <Text variant="menuItem" weight={300}>
          Edit labels
        </Text>
      </MenuItem>
    </LabelPicker>
  );
});

const CollectionRenameMenu = memo(function CollectionRenameMenu({
  children,
}: {
  children: ReactElement;
}) {
  const { session } = useSession();
  const { data, mutate } = useCollectionContext();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: data.name,
      emoji: data.emoji,
    },
  });
  const [loading, setLoading] = useState(false);
  const menuRef = useRef<BottomSheetModal>(null);

  const handleSave = async (newData) => {
    try {
      setLoading(true);
      await sendApiRequest(
        session,
        "PUT",
        "space/collections",
        {},
        {
          body: JSON.stringify({ ...newData, id: data.id }),
        }
      );
      await mutate();
      Toast.show({ type: "success", text1: "Saved!" });
    } catch (e) {
      Toast.show({ type: "error", text1: "Something went wrong" });
    } finally {
      setLoading(false);
      menuRef.current?.close();
    }
  };

  return (
    <Menu
      height={[207]}
      menuRef={menuRef}
      trigger={
        <MenuItem>
          <Icon>edit</Icon>
          <Text variant="menuItem" weight={300}>
            Name & icon
          </Text>
        </MenuItem>
      }
    >
      <View
        style={{
          padding: 20,
          paddingVertical: 0,
          gap: 20,
          flexDirection: "row",
        }}
      >
        <Controller
          name="emoji"
          rules={{ required: true }}
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <EmojiPicker emoji={value} setEmoji={onChange}>
              <IconButton
                variant="outlined"
                style={{ borderStyle: "dashed", borderWidth: 2 }}
                size={70}
              >
                <Emoji emoji={value} size={40} />
              </IconButton>
            </EmojiPicker>
          )}
        />
        <Controller
          name="name"
          rules={{ required: true }}
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              placeholder="Collection name"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              variant="filled+outlined"
              style={{
                paddingHorizontal: 20,
                paddingVertical: 15,
                fontSize: 20,
                flex: 1,
                width: "100%",
                borderColor: errors.name ? "red" : undefined,
              }}
            />
          )}
        />
      </View>
      <View style={{ padding: 20, paddingTop: 0 }}>
        <Button
          onPress={handleSubmit(handleSave, () =>
            Toast.show({ type: "error", text1: "Please type in a name" })
          )}
          variant="filled"
          isLoading={loading}
          style={{ height: 60, marginTop: 20 }}
        >
          <ButtonText style={{ fontSize: 20 }} weight={800}>
            Save
          </ButtonText>
        </Button>
      </View>
    </Menu>
  );
});

interface CollectionNavbarProps {
  editOrderMode: boolean;
  setEditOrderMode: (value: boolean) => void;
}

const ShareCollection = memo(function ShareCollection() {
  const ref = useRef<BottomSheetModal>(null);
  const { id } = useLocalSearchParams();
  const breakpoints = useResponsiveBreakpoints();
  const theme = useColorTheme();

  const handleOpen = useCallback(() => ref.current?.present(), []);
  const handleClose = useCallback(() => ref.current?.close(), []);

  const copyInviteLink = useCallback(async () => {
    try {
      Toast.show({ type: "success", text1: "Coming soon!" });
    } catch (e) {
      Toast.show({ type: "error", text1: "Something went wrong" });
    }
  }, []);

  return (
    <>
      <MenuPopover
        trigger={
          breakpoints.md ? (
            <Pressable
              style={({ pressed, hovered }: any) => [
                styles.navbarIconButton,
                {
                  backgroundColor: theme[pressed ? 11 : hovered ? 10 : 9],
                  width: breakpoints.md ? 120 : 50,
                  gap: 15,
                },
                id === "all" && {
                  backgroundColor: theme[3],
                  opacity: 0.5,
                  pointerEvents: "none",
                },
              ]}
            >
              <Icon style={{ color: theme[id === "all" ? 8 : 1] }}>
                ios_share
              </Icon>
              {breakpoints.md && (
                <Text
                  style={{ color: theme[id === "all" ? 8 : 1] }}
                  weight={400}
                >
                  Share
                </Text>
              )}
            </Pressable>
          ) : (
            <IconButton variant="outlined" size={40} icon="ios_share" />
          )
        }
        containerStyle={{ marginLeft: -25 }}
        options={[
          {
            icon: "link",
            text: "Copy invite link",
            callback: copyInviteLink,
          },
          {
            icon: "person_add",
            text: "Members",
            callback: handleOpen,
          },
        ]}
      />
      <BottomSheet onClose={handleClose} sheetRef={ref} snapPoints={["60%"]}>
        <View style={{ padding: 25 }}>
          <Text weight={900} style={{ fontSize: 25 }}>
            Members
          </Text>
        </View>
      </BottomSheet>
    </>
  );
});

export const CollectionNavbar = memo(function CollectionNavbar({
  editOrderMode,
  setEditOrderMode,
}: CollectionNavbarProps) {
  const theme = useColorTheme();
  const { data, ...ctx } = useCollectionContext();
  const breakpoints = useResponsiveBreakpoints();
  const { type, id } = useGlobalSearchParams();
  const insets = useSafeAreaInsets();

  const isAll = id === "all";

  const options = [
    { icon: "calendar_today", text: "Agenda" },
    { icon: "view_kanban", text: "Kanban" },
    { icon: "view_agenda", text: "Stream" },
    { icon: "view_cozy", text: "Grid" },
    { icon: "exercise", text: "Workload" },
  ].map((i) => ({
    ...i,
    selected: i.text.toLowerCase() === type,
    callback: () => router.setParams({ type: i.text.toLowerCase() }),
  }));

  const collectionMenuOptions = [
    !isAll && {
      icon: "edit",
      text: "Edit",
      renderer: (props) => (
        <CollectionContext.Provider value={{ data, ...ctx }}>
          <CollectionRenameMenu {...props} />
        </CollectionContext.Provider>
      ),
    },
    !isAll && {
      icon: "label",
      text: "Edit labels",
      renderer: (props) => (
        <CollectionContext.Provider value={{ data, ...ctx }}>
          <CollectionLabelMenu {...props} />
        </CollectionContext.Provider>
      ),
    },
    {
      icon: "priority",
      text: "Show completed",
      selected: true,
    },
    !isAll &&
      type === "grid" && {
        icon: "grid_on",
        text: "Reorder labels",
        callback: () => setEditOrderMode(true),
      },
    !isAll && {
      icon: "remove_selection",
      text: "Delete",
      renderer: () => (
        <ConfirmationModal
          height={450}
          onSuccess={() => alert("coming soon")}
          title="Delete collection?"
          secondary="This won't delete any labels or its contents. Any opened views with this collection will be closed"
        >
          <MenuItem>
            <Icon>delete</Icon>
            <Text variant="menuItem" weight={300}>
              Delete
            </Text>
          </MenuItem>
        </ConfirmationModal>
      ),
    },
  ].filter((e) => e);

  const filterOptions = [
    {
      icon: "auto_awesome",
      text: "Auto",
      callback: () => alert("filter auto"),
    },
    {
      icon: "sort_by_alpha",
      text: "Alphabetical",
      callback: () => alert("filter az"),
    },
    {
      icon: "calendar_month",
      text: "Due date",
      callback: () => alert("filter due"),
    },
    {
      icon: "timeline",
      text: "Last edited",
      callback: () => alert("filter edited"),
    },
  ];
  const { sidebarMargin } = useSidebarContext();

  // useKeyboardShortcut(["v a", "v k", "v s", "v m", "v g", "v d"], (key) => {
  //   const index = options.findIndex(
  //     (i) => i.text[0].toLowerCase() === key.split(" ")[1]
  //   );
  //   options[index].callback();
  // });

  // useKeyboardShortcut(["f a", "f d", "f l", "f t"], (key) => {
  //   const index = filterOptions.findIndex(
  //     (i) => i.text[0].toLowerCase() === key.split(" ")[1]
  //   );
  //   filterOptions[index].callback();
  // });

  // useKeyboardShortcut(["s"], () => alert("Stopwatch"));
  // useKeyboardShortcut(["a"], () => alert("Activity"));
  // useKeyboardShortcut(["i"], () => alert("Share"));

  return editOrderMode ? (
    <View
      style={{
        height: 80,
        paddingHorizontal: 15,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        borderBottomWidth: 1,
        borderBottomColor: theme[6],
      }}
    >
      <View>
        <Text weight={900}>Reorder labels</Text>
        <Text style={{ opacity: 0.6 }}>{data.name}</Text>
      </View>
      <IconButton
        icon="check"
        variant="filled"
        size={55}
        style={{ marginLeft: "auto" }}
        onPress={() => setEditOrderMode(false)}
      />
    </View>
  ) : (
    <>
      <LinearGradient
        colors={breakpoints.md ? [theme[1]] : [theme[2], theme[3]]}
        style={{
          height: 80 + insets.top,
          paddingTop: insets.top,
          paddingHorizontal: 15,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        {!breakpoints.md && (
          <IconButton
            icon="arrow_back_ios_new"
            onPress={() => (sidebarMargin.value = 0)}
          />
        )}
        <View style={!breakpoints.md && { flex: 1 }}>
          <MenuPopover
            containerStyle={{ width: 230 }}
            trigger={
              <IconButton
                variant="filled"
                style={[
                  styles.navbarIconButton,
                  {
                    backgroundColor: "transparent",
                    height: 30,
                    gap: 10,
                    width: "auto",
                    justifyContent: "flex-start",
                    paddingRight: 5,
                  },
                ]}
              >
                {!isAll && <Emoji emoji={data.emoji} size={30} />}
                <View>
                  <Text style={{ fontSize: 20 }}>
                    {data.name || "Everything"}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 5,
                      marginTop: -3,
                    }}
                  >
                    <Icon size={20}>sync_alt</Icon>
                    {data.integration && (
                      <Text style={{ fontSize: 12, opacity: 0.6 }}>
                        {capitalizeFirstLetter(
                          data.integration.name.replaceAll("-", " ")
                        )}
                      </Text>
                    )}
                  </View>
                </View>
              </IconButton>
            }
            options={collectionMenuOptions}
          />
        </View>
        <MenuPopover
          menuProps={{
            style: { marginRight: "auto" },
            rendererProps: { placement: "bottom" },
          }}
          trigger={
            <IconButton
              variant={breakpoints.md ? "filled" : "outlined"}
              style={[
                breakpoints.md && styles.navbarIconButton,
                breakpoints.md
                  ? {
                      width: 60,
                      height: 30,
                      paddingLeft: 5,
                      borderLeftColor: theme[6],
                      borderLeftWidth: 2,
                      borderRadius: 0,
                      backgroundColor: "transparent",
                    }
                  : {
                      width: 60,
                      height: 40,
                      paddingLeft: 5,
                      gap: 5,
                      flexDirection: "row",
                    },
              ]}
            >
              <Icon style={{ color: theme[12] }} size={20}>
                {options.find((i) => i.selected)?.icon || "calendar_today"}
              </Icon>
              <Icon style={{ marginLeft: -4, color: theme[12] }}>
                expand_more
              </Icon>
            </IconButton>
          }
          options={options}
        />
        {type === "agenda" && breakpoints.md && <AgendaNavbarButtons />}
        <MenuPopover
          menuProps={{
            rendererProps: { placement: "bottom" },
          }}
          trigger={
            <IconButton variant="outlined" size={40} icon="filter_list" />
          }
          options={filterOptions}
        />
        <ShareCollection />
      </LinearGradient>
      {type === "agenda" && !breakpoints.md && <AgendaNavbarButtons />}
    </>
  );
});
