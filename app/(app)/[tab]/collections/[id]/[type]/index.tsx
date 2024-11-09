import {
  CollectionContext,
  CollectionType,
  useCollectionContext,
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
import { FadeOnRender } from "@/components/layout/FadeOnRender";
import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import { useColorTheme } from "@/ui/color/theme-provider";
import Emoji from "@/ui/Emoji";
import ErrorAlert from "@/ui/Error";
import OtpInput from "@/ui/OtpInput";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import dayjs from "dayjs";
import {
  router,
  useGlobalSearchParams,
  useLocalSearchParams,
} from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { InteractionManager, Pressable, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
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
  <>
    <CollectionNavbar isLoading />
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      {error ? <ErrorAlert /> : <Spinner />}
    </View>
  </>
);

function PasswordPrompt({ mutate }) {
  const theme = useColorTheme();
  const { data } = useCollectionContext();
  const ref = useRef(null);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const { session } = useSession();

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const handleSubmit = async (defaultCode) => {
    setLoading(true);
    try {
      const t = await sendApiRequest(
        session,
        "POST",
        "space/collections/collection/unlock",
        {},
        {
          body: JSON.stringify({
            id: data.id,
            pinCode: defaultCode || code,
          }),
        }
      );
      if (t.error) {
        throw new Error(t.error);
      }
      await mutate();
    } catch (e) {
      setLoading(false);
      ref.current?.clear();
      Toast.show({ type: "error" });
      console.log(e);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          maxWidth: 400,
          width: "100%",
          alignItems: "center",
          padding: 20,
          borderRadius: 20,
          backgroundColor: theme[2],
        }}
      >
        <View
          style={{
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            marginBottom: 5,
          }}
        >
          <Emoji emoji={data?.emoji} size={40} />
          <Text variant="eyebrow">{data?.name}</Text>
        </View>
        <Text
          style={{
            fontSize: 18,
            marginBottom: 10,
          }}
          weight={300}
        >
          Enter the PIN code to open this collection
        </Text>
        <OtpInput
          ref={ref}
          numberOfDigits={6}
          containerGap={5}
          onTextChange={setCode}
          onFilled={(t) => handleSubmit(t)}
        />
        <Button
          isLoading={loading}
          text="Unlock"
          icon="key"
          variant="filled"
          large
          bold
          onPress={handleSubmit}
          containerStyle={{ width: "100%", marginTop: 10 }}
        />
      </View>
    </View>
  );
}

export default function Page({ isPublic }: { isPublic: boolean }) {
  const { id, type }: any = useLocalSearchParams();
  const sheetRef = useRef(null);
  const breakpoints = useResponsiveBreakpoints();
  const t = useGlobalSearchParams();

  const swrKey = useMemo(
    () =>
      id
        ? [
            "space/collections/collection",
            id === "all"
              ? { all: "true", id: "??" }
              : { id, isPublic: isPublic ? "true" : "false" },
          ]
        : null,
    [id, isPublic]
  );
  const { data, mutate, error } = useSWR(swrKey);

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
      content = <Kanban />;
      break;
    case "stream":
      content = <Stream />;
      break;
    case "grid":
      content = <Grid />;
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
    <ContentWrapper noPaddingTop>
      <CollectionContext.Provider value={collectionContextValue}>
        <CollectionLabelMenu sheetRef={sheetRef}>
          <Pressable />
        </CollectionLabelMenu>
        {(data ? (
          !data.pinAuthorizationExpiresAt ||
          dayjs(data.pinAuthorizationExpiresAt).isBefore(dayjs()) ? (
            <PasswordPrompt mutate={mutate} />
          ) : !data?.error ? (
            <>
              <CollectionNavbar />
              <FadeOnRender key={breakpoints.md ? JSON.stringify(t) : "none"}>
                {content}
              </FadeOnRender>
            </>
          ) : (
            false
          )
        ) : (
          false
        )) || <Loading error={error || data?.error} />}
      </CollectionContext.Provider>
    </ContentWrapper>
  );
}

