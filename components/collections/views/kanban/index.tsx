import { useCollectionContext } from "@/components/collections/context";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import IconButton from "@/ui/IconButton";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { ScrollView, useWindowDimensions, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import { CollectionEmpty } from "../CollectionEmpty";
import { Column } from "./Column";
import { KanbanHeader } from "./Header";
import { KanbanContext } from "./context";

function ColumnSwitcher({ entities, columns, setCurrentColumn }) {
  const { width } = useWindowDimensions();

  const ref = React.useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);

  return (
    <>
      <Carousel
        ref={ref}
        width={width}
        height={90}
        data={
          entities
            ? [...columns, { id: "entities", name: "Unlabeled", entities }]
            : columns
        }
        onProgressChange={progress}
        onSnapToItem={(index) =>
          setCurrentColumn(index === columns.length ? -1 : index)
        }
        onScrollStart={() => impactAsync(ImpactFeedbackStyle.Light)}
        mode="parallax"
        loop={false}
        modeConfig={{
          parallaxScrollingScale: 1,
          parallaxScrollingOffset: 25,
        }}
        renderItem={({ item }) => (
          <KanbanHeader
            hasUnlabeled={!!entities}
            carouselRef={ref}
            label={{
              ...item,
              entitiesLength: Object.values(
                item.label?.entities || item?.entities || {}
              ).filter((e) => e.completionInstances.length === 0).length,
            }}
          />
        )}
      />
    </>
  );
}

export default function Kanban() {
  const breakpoints = useResponsiveBreakpoints();
  const { data, openLabelPicker, access, isPublic } = useCollectionContext();

  const [currentColumn, setCurrentColumn] = useState(
    data.labels.length === 0 ? -1 : 0
  );

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
      {!breakpoints.md && (
        <ColumnSwitcher
          columns={columns}
          entities={Object.keys(data.entities || {}).length > 0}
          setCurrentColumn={setCurrentColumn}
        />
      )}
      {data.labels.length === 0 &&
      Object.keys(data?.entities || {}).length === 0 ? (
        <CollectionEmpty />
      ) : (
        <ScrollView
          horizontal
          contentContainerStyle={[
            { flexDirection: "row", gap: 15 },
            breakpoints.md
              ? { padding: 15 }
              : { width: "100%", flexDirection: "column" },
          ]}
          scrollEnabled={breakpoints.md}
        >
          {breakpoints.md
            ? columns.map(
                (label, index) =>
                  label && <Column key={label.id} label={label} index={index} />
              )
            : columns[currentColumn] && (
                <Column label={columns[currentColumn]} index={currentColumn} />
              )}
          {data &&
            Object.keys(data.entities)?.length > 0 &&
            (breakpoints.md || currentColumn === -1) && (
              <Column entities={data.entities} index={currentColumn} />
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
                size={50}
                onPress={openLabelPicker}
              />
            </View>
          )}
        </ScrollView>
      )}
    </KanbanContext.Provider>
  );
}

