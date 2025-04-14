import React from 'react';
import Svg, { Rect, Defs, ClipPath } from 'react-native-svg';
import { View } from 'react-native';

type VerticalBarProps = {
    width: number;
    height: number;
    value: number;
    maxValue: number;
    color?: string;
    backgroundColor?: string;
    backgroundOpacity?: number;
    fillOpacity?: number;
};

export const VerticalBar: React.FC<VerticalBarProps> = ({
                                                            width,
                                                            height,
                                                            value,
                                                            maxValue,
                                                            color = 'orange',
                                                            backgroundColor = '#333',
                                                            backgroundOpacity = 1,
                                                            fillOpacity = 1,
                                                        }) => {
    const clampedValue = Math.max(0, Math.min(value, maxValue));
    const fillHeight = (clampedValue / maxValue) * height;
    const radius = width / 2;

    return (
        <View style={{ width, height }}>
            <Svg width={width} height={height}>
                <Defs>
                    <ClipPath id="rounded-clip">
                        <Rect x={0} y={0} width={width} height={height} rx={radius} />
                    </ClipPath>
                </Defs>

                {/* Фоновая шкала */}
                <Rect
                    x={0}
                    y={0}
                    width={width}
                    height={height}
                    rx={radius}
                    fill={backgroundColor}
                    fillOpacity={backgroundOpacity}
                />

                {/* Заполненная шкала */}
                <Rect
                    x={0}
                    y={height - fillHeight}
                    width={width}
                    height={fillHeight}
                    fill={color}
                    fillOpacity={fillOpacity}
                    rx={radius}
                    clipPath="url(#rounded-clip)"
                />
            </Svg>
        </View>
    );
};
