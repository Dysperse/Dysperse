import { StyleSheet } from "react-native";

export const authStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 15,
    justifyContent: "flex-end",
  },
  title: {
    fontSize: 60,
    lineHeight: 60,
    fontFamily: "heading",
  },
  subtitleContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    rowGap: 10,
    opacity: 0.8,
    marginBottom: 10,
    marginTop: -10,
  },
  word: {
    fontSize: 20,
    fontFamily: "body_300",
  },
  chipWord: {
    fontSize: 18,
    fontFamily: "body_300",
  },
  button: {
    width: "100%",
    height: 80,
    justifyContent: "center",
  },
  buttonText: { fontSize: 20, fontFamily: "body_900" },
});
