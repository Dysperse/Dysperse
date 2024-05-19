import { StyleSheet } from "react-native";

export const authStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    gap: 15,
    justifyContent: "flex-end",
  },
  containerDesktop: {
    maxWidth: 500,
    marginHorizontal: "auto",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    width: "100%",
    marginVertical: 20,
  },
  title: {
    fontSize: 60,
  },
  subtitleContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    rowGap: 10,
    fontSize: 20,
    fontFamily: "body_800",
    opacity: 0.8,
    marginBottom: 10,
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
    height: 70,
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 20,
    fontFamily: "body_900",
    flex: 1,
    textAlign: "center",
    margin: "auto",
  },
  subtitleText: {
    fontSize: 20,
    fontFamily: "mono",
    color: "#fff",
  },
});
