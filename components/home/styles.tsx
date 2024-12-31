import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  imageBackground: {
    height: "100%",
    width: "100%",
    flex: 1,
  },

  menuButton: {
    position: "absolute",
    top: 17,
    left: 17,
    zIndex: 1,
  },
  content: {
    paddingHorizontal: 50,
    paddingBottom: 70,
    marginHorizontal: "auto",
    marginVertical: "auto",
    paddingTop: 60,
  },
  contentColumnContainer: {
    gap: 50,
    marginBottom: "auto",
    width: "100%",
  },
  leftContainer: {
    gap: 20,
    width: "100%",
  },
  card: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    height: 50,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 20,
    flex: 1,
    flexDirection: "row",
  },
  settingsButton: {
    position: "absolute",
    top: 0,
    right: 10,
    zIndex: 1,
  },
  patternCard: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  patternContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
  },
});

