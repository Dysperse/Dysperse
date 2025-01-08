// import jost from "@/assets/fonts/body/Jost_500Medium.ttf";
// import { cardStyles } from "@/components/insights/cardStyles";
// import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
// import Text from "@/ui/Text";
// import { useColorTheme } from "@/ui/color/theme-provider";
// import { LinearGradient, useFont, vec } from "@shopify/react-native-skia";
// import { View } from "react-native";
// import { Bar, CartesianChart } from "victory-native";``

// export const HourChart = ({ data }) => {
//   const font = useFont(jost, 12);
//   const theme = useColorTheme();
//   const breakpoints = useResponsiveBreakpoints();

//   const barData = [
//     "12AM",
//     "1AM",
//     "2AM",
//     "3AM",
//     "4AM",
//     "5AM",
//     "6AM",
//     "7AM",
//     "8AM",
//     "9AM",
//     "10AM",
//     "11AM",
//     "12PM",
//     "1PM",
//     "2PM",
//     "3PM",
//     "4PM",
//     "5PM",
//     "6PM",
//     "7PM",
//     "8PM",
//     "9PM",
//     "10PM",
//     "11PM",
//   ].map((e, i) => ({
//     hour: e,
//     count: data.byHour[i],
//   }));

//   return (
//     <View
//       style={[
//         cardStyles.container,
//         {
//           borderColor: theme[5],
//           backgroundColor: theme[3],
//         },
//       ]}
//     >
//       <Text
//         style={[{ fontSize: breakpoints.md ? 30 : 25 }, cardStyles.title]}
//         weight={700}
//       >
//         Productivity by hour
//       </Text>
//       <CartesianChart
//         data={barData}
//         xKey="hour"
//         yKeys={["count"]}
//         domainPadding={{ left: 20, right: 20 }}
//         axisOptions={{
//           font,
//           labelColor: theme[11],
//           lineColor: {
//             grid: {
//               y: theme[5],
//               x: "transparent",
//             },
//             frame: theme[5],
//           },
//         }}
//       >
//         {({ points, chartBounds }) => (
//           <Bar
//             chartBounds={chartBounds}
//             points={points.count}
//             roundedCorners={{
//               topLeft: 5,
//               topRight: 5,
//             }}
//           >
//             <LinearGradient
//               start={vec(0, 0)}
//               end={vec(0, 400)}
//               colors={[theme[9], theme[6]]}
//             />
//           </Bar>
//         )}
//       </CartesianChart>
//     </View>
//   );
// };
