import React, { memo, forwardRef } from 'react';
import {View} from 'react-native';
import type { ComponentType } from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg from 'react-native-svg';

// Импорт всех иконок
import Svg0Day from './0_day';
import Svg0Night from './0_night';
import Svg2Day from './2_day';
import Svg2Night from './2_night';
import Svg3Day from './3_day';
import Svg3Night from './3_night';
import Svg45Day from './45_day';
import Svg45Night from './45_night';
import Svg48Day from './48_day';
import Svg48Night from './48_night';
import Svg51Day from './51_day';
import Svg51Night from './51_night';
import Svg53Day from './53_day';
import Svg53Night from './53_night';
import Svg55Day from './55_day';
import Svg55Night from './55_night';
import Svg61Day from './61_day';
import Svg61Night from './61_night';
import Svg63Day from './63_day';
import Svg63Night from './63_night';
import Svg65Day from './65_day';
import Svg65Night from './65_night';
import Svg71Day from './71_day';
import Svg71Night from './71_night';
import Svg75Day from './75_day';
import Svg75Night from './75_night';
import Svg96Day from './96_day';
import Svg96Night from './96_night';
import Svg1Day from "./1_day";
import Svg1Night from "./1_night";
import Svg56Day from "./56_day";
import Svg56Night from "./56_night";
import Svg66Day from "./66_day";
import Svg66Night from "./66_night";
import Svg67Day from "./67_day";
import Svg67Night from "./67_night";
import Svg73Day from "./73_day";
import Svg73Night from "./73_night";
import Svg77Day from "./77_day";
import Svg77Night from "./77_night";
import Svg99Day from "./99_day";
import Svg99Night from "./99_night";
import Svg80Day from "./80_day";
import Svg80Night from "./80_night";
import Svg81Day from "./81_day";
import Svg81Night from "./81_night";
import Svg82Day from "./82_day";
import Svg82Night from "./82_night";
import Svg85Day from "./85_day";
import Svg85Night from "./85_night";
import Svg86Day from "./86_day";
import Svg86Night from "./86_night";
import Svg95Day from "./95_day";
import Svg95Night from "./95_night";

// Обновляем тип для компонентов иконок, чтобы поддерживать ref
type WeatherIconComponent = ComponentType<WeatherIconProps>;

// Карта соответствий кодов погод и компонент
const WEATHER_ICONS_MAP: Record<string, WeatherIconComponent> = {
    '0-day': Svg0Day,
    '0-night': Svg0Night,
    '1-day': Svg1Day,
    '1-night': Svg1Night,
    '2-day': Svg2Day,
    '2-night': Svg2Night,
    '3-day': Svg3Day,
    '3-night': Svg3Night,
    '45-day': Svg45Day,
    '45-night': Svg45Night,
    '48-day': Svg48Day,
    '48-night': Svg48Night,
    '51-day': Svg51Day,
    '51-night': Svg51Night,
    '53-day': Svg53Day,
    '53-night': Svg53Night,
    '55-day': Svg55Day,
    '55-night': Svg55Night,
    '56-day': Svg56Day,
    '56-night': Svg56Night,
    '61-day': Svg61Day,
    '61-night': Svg61Night,
    '63-day': Svg63Day,
    '63-night': Svg63Night,
    '65-day': Svg65Day,
    '65-night': Svg65Night,
    '66-day': Svg66Day,
    '66-night': Svg66Night,
    '67-day': Svg67Day,
    '67-night': Svg67Night,
    '71-day': Svg71Day,
    '71-night': Svg71Night,
    '73-day': Svg73Day,
    '73-night': Svg73Night,
    '75-day': Svg75Day,
    '75-night': Svg75Night,
    '77-day': Svg77Day,
    '77-night': Svg77Night,
    '80-day': Svg80Day,
    '80-night': Svg80Night,
    '81-day': Svg81Day,
    '81-night': Svg81Night,
    '82-day': Svg82Day,
    '82-night': Svg82Night,
    '85-day': Svg85Day,
    '85-night': Svg85Night,
    '86-day': Svg86Day,
    '86-night': Svg86Night,
    '95-day': Svg95Day,
    '95-night': Svg95Night,
    '96-day': Svg96Day,
    '96-night': Svg96Night,
    '99-day': Svg99Day,
    '99-night': Svg99Night,
};

type WeatherIconProps = {
    code: string;
    isDay?: boolean;
    size?: number;
    fill?: string;
} & Omit<SvgProps, 'width' | 'height' | 'fill'>;


const WeatherIcon = forwardRef<Svg, WeatherIconProps>(
    (props : WeatherIconProps, ref) => {
        const iconKey = `${props.code}-${props.isDay ? 'day' : 'night'}`;
        const IconComponent = WEATHER_ICONS_MAP[iconKey];

        if (!IconComponent) {
            console.warn(`Icon not found: ${iconKey}`);
            return (
                <View
                    style={{
                        width: props.size,
                        height: props.size,
                        backgroundColor: '#ff000020',
                        borderWidth: 1,
                        borderColor: '#ff0000',
                    }}
                />
            );
        }


        const svgProps = {
            ...props,
            width: props.size,
            height: props.size,
            fill: props.fill,
            ref: ref,
        };

        return (
            <IconComponent
                {...svgProps}
            />
        );
    }
);

export default memo(WeatherIcon);