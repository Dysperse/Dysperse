import {
  CollectionContext,
  useCollectionContext,
} from "@/components/collections/context";
import { CollectionInfo } from "@/components/collections/navbar/CollectionInfo";
import { useHotkeys } from "@/helpers/useHotKeys";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { BlurView } from "expo-blur";
import { router, useLocalSearchParams } from "expo-router";
import { Platform, ScrollView, View } from "react-native";
import useSWR from "swr";

function Share({ handleClose }) {
  const theme = useColorTheme();
  const collection = useCollectionContext();
  useHotkeys("esc", () => router.back());

  return (
    <BlurView intensity={30} style={{ flex: 1 }}>
      <IconButton
        size={55}
        icon="close"
        onPress={handleClose}
        style={{
          position: "absolute",
          top: 30,
          left: 30,
          zIndex: 1,
          borderWidth: 2,
        }}
        variant="outlined"
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{
          gap: 10,
          paddingHorizontal: 20,
          paddingTop: 60,
          flex: 1,
          backgroundColor: addHslAlpha(
            theme[1],
            Platform.OS === "android" ? 1 : 0.8
          ),
        }}
      >
        <View
          style={{
            width: 500,
            maxWidth: "100%",
            marginHorizontal: "auto",
            flex: 1,
          }}
        >
          <View>
            <Text
              style={{
                textAlign: "center",
                fontFamily: "serifText800",
                fontSize: 40,
                marginTop: 30,
                marginBottom: 20,
              }}
            >
              Customize
            </Text>
            <CollectionInfo collection={collection} navigation={{}} />
          </View>
        </View>
      </ScrollView>
    </BlurView>
  );
}

export default function Page() {
  const handleClose = () =>
    router.canGoBack() ? router.back() : router.navigate("/");

  const { id }: any = useLocalSearchParams();
  const { data, mutate, error } = useSWR(
    id
      ? [
          "space/collections/collection",
          id === "all" ? { all: "true", id: "??" } : { id },
        ]
      : null
  );

  const contextValue: CollectionContext = {
    data,
    type: "kanban",
    mutate,
    error,
    access: data?.access,
    openLabelPicker: () => {},
    swrKey: "space/collections/collection",
  };

  return (
    <CollectionContext.Provider value={contextValue}>
      {data && <Share handleClose={handleClose} />}
    </CollectionContext.Provider>
  );
}

