import Text from "@/ui/Text";
import dayjs, { OpUnitType } from "dayjs";
import { router, useLocalSearchParams, usePathname } from "expo-router";
import { createContext, useContext } from "react";
import { Button, StatusBar } from "react-native";

const AgendaContext = createContext({
  view: "week",
  start: dayjs().utc().startOf("week"),
  end: dayjs().utc().endOf("week"),
});
export const useAgendaContext = () => useContext(AgendaContext);

export default function Page() {
  // Note: Everything must be AS performant as POSSIBLE!!!
  const pathname = usePathname();
  const { view, start } = useLocalSearchParams();

  return (
    <AgendaContext.Provider
      value={{
        view: view as string,
        start: dayjs(start as string).startOf(view as OpUnitType),
        end: dayjs(start as string).endOf(view as OpUnitType),
      }}
    >
      <StatusBar barStyle="dark-content" />
      <Text>{pathname}</Text>
    </AgendaContext.Provider>
  );
}
