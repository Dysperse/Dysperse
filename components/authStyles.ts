import { StyleSheet } from "react-native";

export const authStyles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 15,
    justifyContent: "flex-end",
  },
  containerDesktop: {},
  title: {
    fontSize: 30,
  },
  subtitleContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    rowGap: 10,
    fontSize: 20,
    opacity: 0.8,
    marginBottom: 10,
  },
  button: {
    width: "100%",
    height: 70,
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 20,
    flex: 1,
    textAlign: "center",
    margin: "auto",
  },
  subtitleText: {
    fontSize: 20,
    color: "#fff",
  },
});

