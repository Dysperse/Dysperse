import { StyleSheet } from "react-native";

export const labelPickerStyles = StyleSheet.create({
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    marginBottom: 10,
    marginRight: 10,
    borderWidth: 1,
  },
  sectionError: {
    
  },
  labelOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 25,
    gap: 15,
    paddingVertical: 5,
  },
  labelDot: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  labelSubHeading: {
    opacity: 0.6,
  },
});
