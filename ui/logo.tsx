import * as React from "react";
import Svg from "react-native-svg";

export default function Logo({ size }) {
  return (
    <Svg width={size} height={size} fill={"#606060"} viewBox={`0 0 1000 1000`}>
      <path d="m500,978.06q0-373.12,0,0c-57.96-373.12-104.94-420.1-478.06-478.06q373.12,0,0,0c373.12-57.96,420.1-104.94,478.06-478.06q0,373.12,0,0c57.96,373.12,104.94,420.1,478.06,478.06q-373.12,0,0,0c-373.12,57.96-420.1,104.94-478.06,478.06Z" />
    </Svg>
  );
}
