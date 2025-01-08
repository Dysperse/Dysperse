// import { cardStyles } from "@/components/insights/cardStyles";
// import { useLabelColors } from "@/components/labels/useLabelColors";
// import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
// import { Button, ButtonText } from "@/ui/Button";
// import Emoji from "@/ui/Emoji";
// import Icon from "@/ui/Icon";
// import Text from "@/ui/Text";
// import { addHslAlpha } from "@/ui/color";
// import { useColorTheme } from "@/ui/color/theme-provider";
// import { LinearGradient, vec } from "@shopify/react-native-skia";
// import React, { useState } from "react";
// import { View } from "react-native";
// import { AbstractChartConfig } from "react-native-chart-kit/dist/AbstractChart";
// import { Pie, PolarChart } from "victory-native";

// function calculateGradientPoints(
//   radius: number,
//   startAngle: number,
//   endAngle: number,
//   centerX: number,
//   centerY: number
// ) {
//   // Calculate the midpoint angle of the slice for a central gradient effect
//   const midAngle = (startAngle + endAngle) / 2;

//   // Convert angles from degrees to radians
//   const startRad = (Math.PI / 180) * startAngle;
//   const midRad = (Math.PI / 180) * midAngle;

//   // Calculate start point (inner edge near the pie's center)
//   const startX = centerX + radius * 0.5 * Math.cos(startRad);
//   const startY = centerY + radius * 0.5 * Math.sin(startRad);

//   // Calculate end point (outer edge of the slice)
//   const endX = centerX + radius * Math.cos(midRad);
//   const endY = centerY + radius * Math.sin(midRad);

//   return { startX, startY, endX, endY };
// }

// export const LabelChart = ({ data }) => {
//   const theme = useColorTheme();
//   const [showMore, setShowMore] = useState(false);
//   const handleShowMore = () => setShowMore(!showMore);

//   const chartConfig: AbstractChartConfig = {
//     backgroundGradientFrom: "transparent",
//     backgroundGradientTo: "transparent",
//     color: (n = 1) => addHslAlpha(theme[11], n),
//     barPercentage: 0.5,
//     barRadius: 5,
//     paddingRight: 0,
//   };

//   const colors = useLabelColors();
//   const breakpoints = useResponsiveBreakpoints();

//   const pieData = Object.entries(data.byLabel).map(([label]) => ({
//     label: data.byLabel[label].label.name,
//     value: data.byLabel[label].count,
//     emoji: data.byLabel[label].label.emoji,
//     colors: [
//       colors[data.byLabel[label].label.color][9],
//       colors[data.byLabel[label].label.color][11],
//     ],
//   }));

//   return pieData.length === 0 ? (
//     <View
//       style={{
//         backgroundColor: theme[3],
//         borderWidth: 1,
//         borderColor: theme[5],
//         borderRadius: 25,
//         marginTop: 20,
//         padding: 30,
//         gap: 5,
//       }}
//     >
//       <Text style={[cardStyles.title, { marginTop: 0 }]} weight={700}>
//         Completed tasks by label
//       </Text>
//       <Text
//         style={{
//           fontSize: 20,
//           opacity: 0.5,
//         }}
//         weight={300}
//       >
//         No labels have been used yet
//       </Text>
//     </View>
//   ) : (
//     <View
//       style={{
//         backgroundColor: theme[3],
//         borderWidth: 1,
//         borderColor: theme[5],
//         borderRadius: 25,
//         marginTop: 20,
//         flexDirection: breakpoints.md ? "row" : "column",
//       }}
//     >
//       <View>
//         <Text
//           style={[cardStyles.title, { margin: 30, marginBottom: 0 }]}
//           weight={700}
//         >
//           Completed tasks by label
//         </Text>
//         <View style={{ flex: 1, padding: 20, aspectRatio: 1, maxWidth: 400 }}>
//           <PolarChart
//             data={pieData}
//             colorKey={"colors"}
//             valueKey={"value"}
//             labelKey={"label"}
//           >
//             <Pie.Chart innerRadius={"50%"}>
//               {({ slice }) => {
//                 const { startX, startY, endX, endY } = calculateGradientPoints(
//                   slice.radius,
//                   slice.startAngle,
//                   slice.endAngle,
//                   slice.center.x,
//                   slice.center.y
//                 );

//                 return (
//                   <>
//                     <Pie.Slice>
//                       <LinearGradient
//                         start={vec(startX, startY)}
//                         end={vec(endX, endY)}
//                         colors={[slice.color[0], slice.color[1]]}
//                         positions={[0, 1]}
//                       />
//                     </Pie.Slice>
//                     <Pie.SliceAngularInset
//                       angularInset={{
//                         angularStrokeWidth: 5,
//                         angularStrokeColor: theme[3],
//                       }}
//                     />
//                   </>
//                 );
//               }}
//             </Pie.Chart>
//           </PolarChart>
//         </View>
//       </View>
//       <View
//         style={{
//           flex: breakpoints.md ? 1 : undefined,
//           marginTop: breakpoints.md ? 100 : 0,
//           justifyContent: "center",
//         }}
//       >
//         {pieData.slice(0, showMore ? pieData.length : 7).map((label, i) => (
//           <View
//             key={i}
//             style={{
//               flexDirection: "row",
//               alignItems: "center",
//               padding: 10,
//               paddingHorizontal: 20,
//               gap: 20,
//               borderBottomWidth:
//                 i === pieData.length - 1 || (!showMore && i === 6) ? 0 : 1,
//               borderBottomColor: theme[5],
//             }}
//           >
//             <Emoji emoji={label.emoji} size={30} />
//             <Text style={{ fontSize: 20 }} weight={300}>
//               {label.label}
//             </Text>
//             <Text style={{ marginLeft: "auto", opacity: 0.5 }} weight={700}>
//               {label.value}
//             </Text>
//           </View>
//         ))}
//         {pieData.length > 5 && (
//           <View style={{ padding: 10 }}>
//             <Button onPress={handleShowMore} variant="outlined">
//               <ButtonText>{showMore ? "Show less" : "Show more"}</ButtonText>
//               <Icon>{showMore ? "expand_less" : "expand_more"}</Icon>
//             </Button>
//           </View>
//         )}
//       </View>
//     </View>
//   );
// };
