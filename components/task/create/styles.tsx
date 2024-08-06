import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  menuContainer: {
    position: "absolute",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "gray",
    zIndex: 100000000, // Ensure the menu is above other components
  },
  attachmentCard: {
    borderRadius: 25,
    padding: 20,
    flexDirection: "column",
    flex: 1,
  },
  attachmentCardText: {
    fontSize: 20,
    marginTop: -5,
    paddingLeft: 5,
  },
  gridRow: {
    flexDirection: "row",
    gap: 15,
    marginTop: 15,
  },
});
