import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const SvgComponent = (props: SvgProps & { theme: { isDark: boolean } }) => {
  return (
    <Svg width={24} height={23} fill="none" {...props}>
      <Path
        d="m6.343 5.852 11.314 11.314M6.343 17.166 17.657 5.852"
        stroke={
          props.color ? props.color : props.theme.isDark ? "#FFFFFF" : "#292D32"
        }
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default SvgComponent;
