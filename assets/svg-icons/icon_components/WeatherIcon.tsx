import React, { memo, forwardRef } from 'react';
import { View } from 'react-native';
import type { ComponentType, ForwardedRef } from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg from 'react-native-svg';

// Обновляем тип для компонентов иконок, чтобы поддерживать ref
type IconComponentType = ComponentType<SvgProps & { fill?: string }>;
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

// Карта соответствий кодов погод и компонент
const iconMap: Record<string, IconComponentType> = {
    '0-day': Svg0Day,
    '0-night': Svg0Night,
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
    '61-day': Svg61Day,
    '61-night': Svg61Night,
    '63-day': Svg63Day,
    '63-night': Svg63Night,
    '65-day': Svg65Day,
    '65-night': Svg65Night,
    '71-day': Svg71Day,
    '71-night': Svg71Night,
    '75-day': Svg75Day,
    '75-night': Svg75Night,
    '96-day': Svg96Day,
    '96-night': Svg96Night,
};


type WeatherIconProps = {
    code: string;
    isDay?: boolean;
    size?: number;
    fill?: string;
} & Omit<SvgProps, 'width' | 'height' | 'fill'>;

const WeatherIcon = forwardRef<Svg, WeatherIconProps>(
    (
        { code, isDay = true, size = 96, fill, ...props },
        ref
    ) => {
        const iconKey = `${code}-${isDay ? 'day' : 'night'}`;
        const IconComponent = iconMap[iconKey];

        if (!IconComponent) {
            console.warn(`Icon not found: ${iconKey}`);
            return (
                <View
                    style={{
                        width: size,
                        height: size,
                        backgroundColor: '#ff000020',
                        borderWidth: 1,
                        borderColor: '#ff0000',
                    }}
                />
            );
        }

        const svgProps = {
            ...props,
            width: size,
            height: size,
            fill,
        };

        // Убедитесь, что передаете ref как ForwardedRef<Svg>
        return (
            <IconComponent
                {...svgProps}
            />
        );
    }
);

export default memo(WeatherIcon);