import * as React from "react";
import Svg, { Path } from "react-native-svg";

const Logo = ({ size, color = "#000" }) => {
  const memoizedSvg = React.useMemo(() => {
    return (
      <Svg width={size} height={size} fill={color} viewBox={`0 0 1000 1000`}>
        <Path d="m500,978.06q0-373.12,0,0c-57.96-373.12-104.94-420.1-478.06-478.06q373.12,0,0,0c373.12-57.96,420.1-104.94,478.06-478.06q0,373.12,0,0c57.96,373.12,104.94,420.1,478.06,478.06q-373.12,0,0,0c-373.12,57.96-420.1,104.94-478.06,478.06Z" />
      </Svg>
    );
  }, [size, color]);

  return memoizedSvg;
};

export default Logo;
