import {
  CollectionContext,
  useCollectionContext,
} from "@/components/collections/context";
import { RouteDialogWrapper } from "@/components/layout/route-dialog";
import { RouteDialogContent } from "@/components/layout/route-dialog/content";
import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import { useColorTheme } from "@/ui/color/theme-provider";
import Emoji from "@/ui/Emoji";
import { EmojiPicker } from "@/ui/EmojiPicker";
import IconButton from "@/ui/IconButton";
import TextField from "@/ui/TextArea";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import useSWR from "swr";

function Content({ handleClose }) {
  const theme = useColorTheme();
  const { data, mutate } = useCollectionContext();
  const breakpoints = useResponsiveBreakpoints();

  const { session } = useSession();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: data.name,
      emoji: data.emoji,
      description: data.description,
    },
  });
  const [loading, setLoading] = useState(false);

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
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <View
        style={{
          padding: 20,
          paddingVertical: 0,
          gap: 20,
          flexDirection: breakpoints.md ? "row" : "column",
          flex: 1,
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
                style={{
                  borderStyle: "dashed",
                  borderWidth: 2,
                  alignSelf: breakpoints.md ? undefined : "center",
                }}
                size={70}
              >
                <Emoji emoji={value} size={40} />
              </IconButton>
            </EmojiPicker>
          )}
        />
        <View style={{ flex: 1, gap: 10 }}>
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
                  width: "100%",
                  borderColor: errors.name ? "red" : theme[6],
                }}
              />
            )}
          />
          <Controller
            name="description"
            rules={{ required: true }}
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                placeholder="What's this collection about?"
                multiline
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
                  verticalAlign: "top",
                  borderColor: errors.name ? "red" : theme[6],
                }}
              />
            )}
          />
        </View>
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
    </View>
  );
}

function Page({ handleClose }) {
  const listRef = useRef(null);

  const scrollToTop = () => {
    listRef.current?.scrollToOffset({ animated: true, offset: 0 });
  };

  const { id }: any = useLocalSearchParams();
  const { data, mutate, error, isValidating } = useSWR(
    id
      ? [
          "space/collections/collection",
          id === "all" ? { all: "true", id: "??" } : { id },
        ]
      : null
  );

  const contextValue = {
    data,
    type: "kanban",
    mutate,
    error,
    access: data?.access,
    isValidating,
  };

  return (
    <View
      style={{ backgroundColor: "rgba(0,0,0,0.05)", flex: 1, width: "100%" }}
    >
      <RouteDialogContent
        title="Collection"
        handleClose={handleClose}
        onHeaderPress={scrollToTop}
      >
        <CollectionContext.Provider value={contextValue as any}>
          {data && <Content handleClose={handleClose} />}
        </CollectionContext.Provider>
      </RouteDialogContent>
    </View>
  );
}

export default function Container() {
  const handleClose = () =>
    router.canGoBack() ? router.back() : router.replace("/");

  return (
    <RouteDialogWrapper>
      <Page handleClose={handleClose} />
    </RouteDialogWrapper>
  );
}
