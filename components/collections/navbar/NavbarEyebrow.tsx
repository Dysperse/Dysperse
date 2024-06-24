import Text from "@/ui/Text";

export const NavbarEyebrow = ({ name }) => {
  return (
    <Text numberOfLines={1} variant="eyebrow" style={{ fontSize: 11 }}>
      {name}
    </Text>
  );
};
