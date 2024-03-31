import { useCollectionContext } from "@/components/collections/context";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Emoji from "@/ui/Emoji";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { CollectionLabelMenu } from "../../navbar/CollectionLabelMenu";
import { Column } from "./Column";
import { KanbanContext } from "./context";

const CollectionEmpty = () => {
  const { id } = useLocalSearchParams();
  const theme = useColorTheme();

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
      }}
    >
      <Emoji size={64} emoji="1f92b" />
      <Text
        style={{ fontSize: 35, marginTop: 15, marginBottom: 5 }}
        weight={900}
      >
        It's quiet here...
      </Text>
      <Text
        style={{
          fontSize: 20,
          opacity: 0.7,
          textAlign: "center",
          marginBottom: 10,
        }}
      >
        {id === "all" && "You haven't created any labels yet. \n"}
        Selected labels appear as columns here.
      </Text>
      <CollectionLabelMenu />
    </View>
  );
};

export function Kanban() {
  const breakpoints = useResponsiveBreakpoints();
  const { data } = useCollectionContext();
  const theme = useColorTheme();

  const [currentColumn, setCurrentColumn] = useState(0);

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
            {
              flexDirection: "row",
              gap: 15,
            },
            breakpoints.md
              ? {
                  padding: 15,
                }
              : {
                  width: "100%",
                },
          ]}
          scrollEnabled={breakpoints.md}
        >
          {breakpoints.md
            ? data.labels.map(
                (label) => label && <Column key={label.id} label={label} />
              )
            : data.labels[currentColumn] && (
                <Column label={data.labels[currentColumn]} />
              )}
          {data.entities?.length > 0 &&
            (breakpoints.md || currentColumn === -1) && (
              <Column entities={data.entities} />
            )}
          {data.labels?.length <= 4 &&
            breakpoints.md &&
            [...new Array(4 - data.labels?.length)].map((_, i) => (
              <View
                key={i}
                style={{
                  width: 300,
                  flex: 1,
                  minWidth: 5,
                  minHeight: 5,
                  backgroundColor: theme[2],
                  borderRadius: 20,
                }}
              />
            ))}
        </ScrollView>
      )}
    </KanbanContext.Provider>
  );
}
