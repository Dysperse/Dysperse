import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { useColorTheme } from "@/ui/color/theme-provider";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingRight: 60,
    paddingTop: 10,
  },
  title: { marginHorizontal: "auto", fontSize: 20 },
  empty: { alignItems: "center", justifyContent: "center", padding: 20 },
  emptyHeading: {
    fontSize: 40,
    textAlign: "center",
    marginTop: 5,
  },
  emptySubheading: {
    textAlign: "center",
    opacity: 0.6,
    fontSize: 20,
  },
});

export function RouteDialogContent({
  children,
  title,
  handleClose,
  onHeaderPress,
}) {
  const theme = useColorTheme();
  const { width, height } = useWindowDimensions();
  const breakpoints = useResponsiveBreakpoints();

  return (
    <View
      style={{
        margin: "auto",
        width: "100%",
        flex: 1,
        shadowColor: "rgba(0, 0, 0, 0.12)",
        shadowOffset: {
          width: 10,
          height: 10,
        },
        shadowOpacity: 1,
        shadowRadius: 30,

        borderColor: theme[5],
        borderWidth: breakpoints.md ? 1 : 0,
        borderRadius: breakpoints.md ? 25 : 10,
        overflow: "hidden",
        maxWidth: breakpoints.md ? 900 : width,
        maxHeight: breakpoints.md ? Math.min(600, height / 1.3) : undefined,
      }}
    >
      <Pressable
        onPress={(e) => e.stopPropagation()}
        style={{ flex: 1, backgroundColor: theme[1] }}
      >
        <Pressable style={styles.header} onPress={onHeaderPress}>
          <IconButton
            size={45}
            icon="arrow_back_ios_new"
            onPress={handleClose}
          />
          <Text style={styles.title} weight={800}>
            {title}
          </Text>
        </Pressable>
        {children}
      </Pressable>
    </View>
  );
}
