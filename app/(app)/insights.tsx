import { MemberSince } from "@/components/insights/MemberSince";
import { COLLECTION_VIEWS } from "@/components/layout/command-palette/list";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import MenuPopover from "@/ui/MenuPopover";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useState } from "react";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import useSWR from "swr";
import { MenuButton } from "./home";

function YearSelector({ years, year, setYear }) {
  return (
    <MenuPopover
      trigger={<Button style={{ marginTop: 20 }} />}
      options={years.map((y) => ({
        text: y.toString(),
        selected: y === year,
        callback: () => setYear(y),
      }))}
    />
  );
}

function Insights({ year }) {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const { data, error } = useSWR(["user/insights", { year }]);

  const cardStyles = {
    backgroundColor: theme[4],
    flex: 1,
    padding: 15,
    borderRadius: 20,
  };

  const textStyles = {
    fontFamily: "serifText700",
    fontSize: 30,
    color: theme[11],
  };

  const labelStyles = {
    opacity: 0.6,
    fontSize: 17,
    color: theme[11],
    fontFamily: "body_700",
  };

  return data ? (
    <View style={{ padding: 20, paddingTop: 0, gap: 10 }}>
      <View
        style={{
          flexDirection: "row",
          gap: 10,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text variant="eyebrow">Climate impact</Text>

        <MenuPopover
          trigger={<Button dense text="About" />}
          containerStyle={{ width: 250 }}
          options={[
            {
              renderer: () => (
                <View style={{ padding: 10 }}>
                  <Text style={{ color: theme[11] }}>
                    This data is calculated based on the number of tasks &
                    collections you've created so far. It's an estimate of how
                    much impact you would make if you were to use regular
                    notebook instead of Dysperse.
                  </Text>
                </View>
              ),
            },
          ]}
        />
      </View>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={cardStyles}>
          <Text style={textStyles}>
            {Math.round(data.treesSaved * 100) / 100}
          </Text>
          <Text style={labelStyles}>Trees saved</Text>
        </View>

        <View style={cardStyles}>
          <Text style={[textStyles]}>
            {~~data.co2}
            {breakpoints.md ? " grams" : "g"}
          </Text>
          <Text style={labelStyles}>of CO2 saved</Text>
        </View>
      </View>

      <Text variant="eyebrow" style={{ marginTop: 10 }}>
        Summary
      </Text>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={cardStyles}>
          <Text style={textStyles}>{data.insights.tasksCreated}</Text>
          <Text style={labelStyles}>Tasks created</Text>
        </View>

        <View style={cardStyles}>
          <Text style={textStyles}>{data.insights.tasksCompleted}</Text>
          <Text style={labelStyles}>Tasks completed</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={cardStyles}>
          <Text style={textStyles}>{data.insights.tasksRescheduled}</Text>
          <Text style={labelStyles}>Tasks rescheduled</Text>
        </View>

        <View style={cardStyles}>
          <Text style={textStyles}>{data.insights.tasksDeleted}</Text>
          <Text style={labelStyles}>Tasks deleted</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={cardStyles}>
          <Text style={textStyles}>{data.insights.aiFeaturesUsed}</Text>
          <Text style={labelStyles}>AI features used</Text>
        </View>

        <View style={cardStyles}>
          <Text style={textStyles}>{data.insights.tabsCreated}</Text>
          <Text style={labelStyles}>Tabs created</Text>
        </View>
      </View>

      <View style={cardStyles}>
        <Text style={labelStyles}>Top views</Text>
        <View
          style={{
            flexDirection: "row",
            gap: 5,
            marginTop: 5,
          }}
        >
          {Object.entries(data.insights.viewCount)
            .sort((a, b) => b[1] - a[1])
            .map(([key, value]) => (
              <View
                style={{
                  height: 200,
                  flex: 1,
                  justifyContent: "flex-end",
                }}
                key={key}
              >
                <View
                  style={{
                    flexDirection: "column",
                    backgroundColor: addHslAlpha(theme[6], 0.7),
                    borderRadius: 15,
                    height: `${Math.max(
                      1,
                      (value /
                        Math.max(...Object.values(data.insights.viewCount))) *
                        100 -
                        15
                    )}%`,
                    justifyContent: "flex-end",
                    alignItems: "center",
                  }}
                />
                <Icon
                  bold
                  style={{ color: theme[11], marginLeft: 7, marginTop: 5 }}
                >
                  {COLLECTION_VIEWS[key].icon}
                </Icon>
              </View>
            ))}
        </View>
      </View>

      <View>
        <View style={cardStyles}>
          <Text style={labelStyles}>By day</Text>
          <View
            style={{
              flexDirection: "row",
              height: 200,
              gap: 20,
              marginTop: 10,
            }}
          >
            {data.byDay.map((day, index) => (
              <View
                key={index}
                style={{
                  flex: 1,
                }}
              >
                <View style={{ flex: 1 }} />
                <View
                  style={{
                    height: `${(day / Math.max(...data.byDay)) * 100}%`,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: addHslAlpha(theme[6], 0.7),
                      borderRadius: 15,
                      alignItems: "center",
                      justifyContent: "flex-end",
                      padding: 5,
                      flex: 1,
                    }}
                  >
                    <Text variant="eyebrow" style={{ fontSize: 13 }}>
                      {day === 0 ? "" : day.toString()}
                    </Text>
                  </View>
                  <View>
                    <Text
                      variant="eyebrow"
                      style={{
                        textAlign: "center",
                        marginTop: 5,
                        marginBottom: -5,
                      }}
                    >
                      {["S", "M", "T", "W", "T", "F", "S"][index]}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View>
        <View style={cardStyles}>
          <Text style={labelStyles}>By hour</Text>
          <View
            style={{
              flexDirection: "row",
              height: 200,
              gap: 5,
              marginTop: 10,
            }}
          >
            {data.byHour.map((day, index) => (
              <View
                key={index}
                style={{
                  flex: 1,
                }}
              >
                <View style={{ flex: 1 }} />
                <View
                  style={{
                    minHeight: 23,
                    height: `${(day / Math.max(...data.byHour)) * 100}%`,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: addHslAlpha(theme[6], 0.7),
                      borderRadius: 15,
                      alignItems: "center",
                      justifyContent: "flex-end",
                      flex: 1,
                      overflow: "visible",
                    }}
                  >
                    <Text
                      variant="eyebrow"
                      style={{
                        fontSize:
                          (index % 12 === 0 ? 12 : index % 12) > 9 ? 7 : 12,
                        fontFamily: "mono",
                        textAlign: "center",
                      }}
                    >
                      {/* hour of day */}
                      {index % 12 === 0 ? 12 : index % 12}
                      {"\n"}
                      <Text
                        style={{
                          fontSize: 7,
                          fontFamily: "mono",
                          opacity: 0.8,
                          color: theme[11],
                        }}
                      >
                        {index < 12 ? "AM" : "PM"}
                      </Text>
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      <MemberSince />
    </View>
  ) : (
    <View>{error ? <ErrorAlert /> : <Spinner />}</View>
  );
}

export default function Page() {
  const { data, error } = useSWR(["user/insights/years"]);
  const [year, setYear] = useState(new Date().getFullYear());
  const theme = useColorTheme();

  return data ? (
    <>
      <MenuButton gradient back />
      <ScrollView
        contentContainerStyle={{ paddingTop: 50, backgroundColor: theme[2] }}
      >
        <Text
          style={{
            fontFamily: "serifText700",
            fontSize: 30,
            textAlign: "center",
            marginTop: 50,
          }}
        >
          Insights
        </Text>
        {data.years.length > 0 && (
          <YearSelector years={data.years} year={year} setYear={setYear} />
        )}
        <Insights year={year} />
      </ScrollView>
    </>
  ) : (
    <View style={{ height: "100%", width: "100%" }}>
      <MenuButton gradient addInsets back />
      <View
        style={{
          height: "100%",
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {error ? <ErrorAlert /> : <Spinner />}
      </View>
    </View>
  );
}

