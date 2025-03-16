import { MenuButton } from "@/app/(app)/home";
import { CollectionContext } from "@/components/collections/context";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { useLocalSearchParams } from "expo-router";
import { Platform, ScrollView, View } from "react-native";
import useSWR from "swr";

export function CollectionMenuLayout({ title, children }) {
  const theme = useColorTheme();

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
          <MenuButton back gradient />
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{
              gap: 10,
              paddingHorizontal: 20,
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
                paddingTop: 60,
                maxWidth: "100%",
                marginHorizontal: "auto",
                flex: 1,
              }}
            >
              <View>
                <Text
                  style={{
                    fontFamily: "serifText700",
                    fontSize: 30,
                    marginTop: 40,
                    marginBottom: 10,
                    paddingHorizontal: 20,
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

