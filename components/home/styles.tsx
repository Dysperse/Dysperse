import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    padding: 20,
    height: 80,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 20,
    flex: 1,
    flexDirection: "row",
  },
  cardOutline: {
    borderWidth: 1,
    borderColor: "#000000",
    padding: 20,
    borderRadius: 20,
  },
  patternCard: {
    width: 100,
    height: 100,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
});
