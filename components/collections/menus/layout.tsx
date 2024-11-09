import { CollectionContext } from "@/components/collections/context";
import IconButton from "@/ui/IconButton";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { router, useLocalSearchParams } from "expo-router";
import { Platform, ScrollView, View } from "react-native";
import useSWR from "swr";

export function CollectionMenuLayout({ title, children }) {
  const theme = useColorTheme();

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
      {data && !data?.error ? (
        <View style={{ flex: 1 }}>
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
                    marginTop: 40,
                    marginBottom: 20,
                  }}
                >
                  {title}
                </Text>
                {children}
              </View>
            </View>
          </ScrollView>
        </View>
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Spinner />
        </View>
      )}
    </CollectionContext.Provider>
  );
}
