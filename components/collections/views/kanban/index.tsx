import { useCollectionContext } from "@/components/collections/context";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import IconButton from "@/ui/IconButton";
import { useColorTheme } from "@/ui/color/theme-provider";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  ScrollView,
  useWindowDimensions,
  View,
} from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import { CollectionEmpty } from "../CollectionEmpty";
import { Column } from "./Column";
import { KanbanHeader } from "./Header";
import { KanbanContext } from "./context";

const width = Dimensions.get("window").width;

function ColumnSwitcher({ columns, setCurrentColumn, currentColumn }) {
  const theme = useColorTheme();
  const { width } = useWindowDimensions();
  const { openLabelPicker } = useCollectionContext();

  const ref = React.useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);

  return (
    <>
      <Carousel
        ref={ref}
        width={width}
        height={90}
        data={columns}
        onProgressChange={progress}
        onSnapToItem={(index) => setCurrentColumn(index)}
        mode="parallax"
        loop={false}
        modeConfig={{
          parallaxScrollingScale: 1,
          parallaxScrollingOffset: 25,
        }}
        renderItem={({ item }) => (
          <KanbanHeader
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

  const [currentColumn, setCurrentColumn] = useState(0);

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
          setCurrentColumn={setCurrentColumn}
          currentColumn={currentColumn}
        />
      )}
      {data.labels.length === 0 ? (
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
                (label) => label && <Column key={label.id} label={label} />
              )
            : columns[currentColumn] && (
                <Column label={columns[currentColumn]} />
              )}
          {data && Object.keys(data.entities)?.length > 0 && breakpoints.md && (
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

