import { memo } from "react";
import Svg, { Path } from "react-native-svg";
import {WeatherIconProps} from "./weather_icon_props";

const Svg0Night = (props: WeatherIconProps) => {
  const { fill = "#000", ...rest } = props;
  return (
      <Svg
          width={96}
          height={96}
          viewBox="0 0 96 96"
          fill="none"
          {...rest}
      >
        <Path
            d="M60,46c-5.514,0-10-4.486-10-10c0-1.104-0.896-2-2-2c-7.72,0-14,6.28-14,14s6.28,14,14,14c7.72,0,14-6.28,14-14
		C62,46.896,61.104,46,60,46z M48,58c-5.514,0-10-4.486-10-10c0-4.888,3.525-8.969,8.168-9.832
		c0.934,5.986,5.677,10.729,11.664,11.664C56.969,54.475,52.889,58,48,58z"
            fill={fill}
        />
      </Svg>
  );
};

export default memo(Svg0Night);
