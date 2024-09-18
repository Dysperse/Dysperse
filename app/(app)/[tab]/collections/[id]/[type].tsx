import {
  CollectionContext,
  CollectionType,
} from "@/components/collections/context";
import CollectionNavbar from "@/components/collections/navbar";
import { CollectionLabelMenu } from "@/components/collections/navbar/CollectionLabelMenu";
import Calendar from "@/components/collections/views/calendar";
import Grid from "@/components/collections/views/grid";
import Kanban from "@/components/collections/views/kanban";
import List from "@/components/collections/views/list";
import Matrix from "@/components/collections/views/matrix";
import Planner from "@/components/collections/views/planner";
import Skyline from "@/components/collections/views/skyline";
import Stream from "@/components/collections/views/stream";
import Workload from "@/components/collections/views/workload";
import ContentWrapper from "@/components/layout/content";
import ErrorAlert from "@/ui/Error";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { InteractionManager, Pressable, StyleSheet, View } from "react-native";
import useSWR from "swr";

export const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    paddingBottom: 10,
    gap: 10,
    marginTop: -15,
  },
});

const Loading = ({ error }) => (
  <ContentWrapper noPaddingTop>
    <CollectionNavbar
      isLoading
      editOrderMode={false}
      setEditOrderMode={() => {}}
    />
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      {error ? <ErrorAlert /> : <Spinner />}
    </View>
  </ContentWrapper>
);

export default function Page({ isPublic }: { isPublic: boolean }) {
  const { id, type }: any = useLocalSearchParams();
  const sheetRef = useRef(null);
  const swrKey = id
    ? [
        "space/collections/collection",
        id === "all"
          ? { all: "true", id: "??" }
          : { id, isPublic: isPublic ? "true" : "false" },
      ]
    : null;
  const { data, mutate, error } = useSWR(swrKey);

  const [editOrderMode, setEditOrderMode] = useState(false);

  useEffect(() => {
    if (!type && isPublic) {
      InteractionManager.runAfterInteractions(() => {
        setTimeout(() => router.setParams({ type: "kanban" }), 200);
      });
    }
  }, [isPublic, type]);

  let content = null;
  switch ((type || (isPublic ? "kanban" : null)) as CollectionType) {
    case "planner":
      content = <Planner />;
      break;
    case "kanban":
      content = <Kanban editOrderMode={editOrderMode} />;
      break;
    case "stream":
      content = <Stream />;
      break;
    case "grid":
      content = <Grid editOrderMode={editOrderMode} />;
      break;
    case "workload":
      content = <Workload />;
      break;
    case "list":
      content = <List />;
      break;
    case "matrix":
      content = <Matrix />;
      break;
    case "calendar":
      content = <Calendar />;
      break;
    case "skyline":
      content = <Skyline />;
      break;
    default:
      content = <Text>404: {type}</Text>;
      break;
  }

  const collectionContextValue = useMemo(
    () => ({
      data,
      mutate,
      error,
      type,
      access: data?.access,
      swrKey,
      isPublic,
      openLabelPicker: () => sheetRef.current?.present(),
    }),
    [data, mutate, error, type, isPublic, swrKey]
  );

  return (
    <CollectionContext.Provider value={collectionContextValue}>
      <CollectionLabelMenu sheetRef={sheetRef}>
        <Pressable />
      </CollectionLabelMenu>
      {data && !data?.error ? (
        <ContentWrapper noPaddingTop>
          <CollectionNavbar
            editOrderMode={editOrderMode}
            setEditOrderMode={setEditOrderMode}
          />
          {content}
        </ContentWrapper>
      ) : (
        <Loading error={error || data?.error} />
      )}
    </CollectionContext.Provider>
  );
}

