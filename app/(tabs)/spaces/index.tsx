import { Text } from "react-native";
import useSWR from "swr";

export default function Page() {
  const { data, error } = useSWR("https://api.dysperse.com/user/spaces");

  return (
    <>
      <Text>{JSON.stringify(data)}</Text>
    </>
  );
}
