import { useCollectionContext } from "@/components/collections/context";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { CollectionEmpty } from "../CollectionEmpty";
import { Column } from "./Column";
import { KanbanContext } from "./context";

function ColumnHome({ columns, setCurrentColumn }) {
  const theme = useColorTheme();

  return (
    <ScrollView
      style={{
        backgroundColor: theme[3],
        borderTopWidth: 1,
        borderTopColor: theme[5],
        flex: 1,
      }}
      contentContainerStyle={{ padding: 20, gap: 20 }}
    >
      <Text
        style={{
          textAlign: "center",
          marginTop: 10,
          color: theme[11],
          fontFamily: "serifText700",
          fontSize: 20,
          opacity: 0.6,
        }}
      >
        {columns.length} column{columns.length !== 1 && "s"}
      </Text>
      <View
        style={{ padding: 10, borderRadius: 20, backgroundColor: theme[4] }}
      >
        {columns.map((column, i) => (
          <ListItemButton
            key={column.id}
            onPress={() => setCurrentColumn(i)}
            backgroundColors={{
              default: theme[4],
              hover: theme[5],
              active: theme[6],
            }}
          >
            <Emoji size={30} emoji={column.emoji} />
            <ListItemText
              primary={column.name}
              secondary={`${Object.keys(column.entities).length} item${
                Object.keys(column.entities).length !== 1 ? "s" : ""
              }`}
            />
            <Icon>arrow_forward_ios</Icon>
          </ListItemButton>
        ))}

        <ListItemButton
          backgroundColors={{
            default: theme[4],
            hover: theme[5],
            active: theme[6],
          }}
        >
          <Icon size={30}>add</Icon>
          <ListItemText primary="Add column..." />
          <Icon>arrow_forward_ios</Icon>
        </ListItemButton>
      </View>
    </ScrollView>
  );
}

export default function Kanban() {
  const breakpoints = useResponsiveBreakpoints();
  const { data, openLabelPicker, access, isPublic } = useCollectionContext();

  const [currentColumn, setCurrentColumn] = useState(-1);

  const { hiddenLabels: rawHiddenLabels } = useLocalSearchParams();
  const hiddenLabels = rawHiddenLabels?.split(",") || [];

  const columns = data.kanbanOrder
    ? data.kanbanOrder
        .map((id) => data.labels.find((l) => l.id === id))
        .filter((c) => !hiddenLabels.includes(c.id))
    : [];

  const isReadOnly = access?.access === "READ_ONLY" || isPublic;

  return !data.labels ? null : (
    <KanbanContext.Provider
      value={{
        currentColumn,
        setCurrentColumn,
        columnsLength: data.labels.length,
        hasOther: data.entities.length > 0,
      }}
    >
      {data.labels.length === 0 ? (
        <CollectionEmpty />
      ) : (
        <ScrollView
          horizontal
          contentContainerStyle={[
            { flexDirection: "row", gap: 15 },
            breakpoints.md ? { padding: 15 } : { width: "100%" },
          ]}
          scrollEnabled={breakpoints.md}
        >
          {breakpoints.md ? (
            columns.map(
              (label) => label && <Column key={label.id} label={label} />
            )
          ) : currentColumn == -1 ? (
            <ColumnHome columns={columns} setCurrentColumn={setCurrentColumn} />
          ) : (
            columns[currentColumn] && <Column label={columns[currentColumn]} />
          )}
          {data &&
            Object.keys(data.entities)?.length > 0 &&
            (breakpoints.md || currentColumn === -1) && (
              <Column entities={data.entities} />
            )}
          {breakpoints.md && !isReadOnly && (
            <View
              style={{
                width: 320,
                maxWidth: 100,
                flex: 1,
                minWidth: 5,
                minHeight: 5,
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconButton
                icon="add"
                variant="outlined"
                size={40}
                onPress={openLabelPicker}
              />
            </View>
          )}
        </ScrollView>
      )}
    </KanbanContext.Provider>
  );
}
