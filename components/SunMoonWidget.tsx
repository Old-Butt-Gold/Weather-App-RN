import React, {useEffect, useState, useMemo} from 'react';
import { View, Text, Dimensions } from 'react-native';
import { Svg, Path, Defs, LinearGradient, Stop, Circle, ClipPath, G } from 'react-native-svg';
import { BlurView } from 'expo-blur';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import RingWithGradient from "../utils/RingWithGradientProps";
import {t} from "i18next";
import Feather from '@expo/vector-icons/Feather';
import {useAppSelector} from "../store/hooks";

interface SunMoonData {
    sunrise: Date;
    sunset: Date;
    moonrise: Date;
    moonset: Date;
    moonPhase: number;
    uvIndex?: number;
}

interface SunMoonWidgetProps {
    currentTime?: Date;
}

const Infolabel = () => (
    <View className="absolute top-5 left-5 flex flex-row justify-center items-center gap-x-2">
        <MaterialIcons name="light-mode" size={16} color="rgba(243, 244, 246,0.6)" />
        <Text className="text-[16px] text-gray-100/60 font-manrope-medium mb-1">
            {t('sunMoon.daylightTime')}
        </Text>
    </View>
);

const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    const angleRad = (angleDeg * Math.PI) / 180;
    return {
        x: cx + r * Math.cos(angleRad),
        y: cy - r * Math.sin(angleRad),
    };
};

const formatTime = (date: Date) => {
    return `${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`;
};

const getMoonPhaseText = (moonIllumination: number) => {
    const phases = [
        {threshold: 0, text: t('sunMoon.newMoon')},
        {threshold: 0.25, text: t('sunMoon.firstQuarter')},
        {threshold: 0.5, text: t('sunMoon.fullMoon')},
        {threshold: 0.75, text: t('sunMoon.lastQuarter')},
    ];

    if (moonIllumination === 0) return phases[0].text;
    if (moonIllumination === 0.25) return phases[1].text;
    if (moonIllumination === 0.5) return phases[2].text;
    if (moonIllumination === 0.75) return phases[3].text;

    return moonIllumination < 0.25 ? t('sunMoon.waxingCrescent') :
        moonIllumination < 0.5 ? t('sunMoon.waxingGibbous') :
            moonIllumination < 0.75 ? t('sunMoon.waningGibbous') : t('sunMoon.waningCrescent');
};

const useCelestialBodyPosition = (
    currentTime: Date,
    riseTime: Date,
    setTime: Date,
    isDaytimeCheck: boolean
) => {
    return useMemo(() => {
        const isVisible = isDaytimeCheck
            ? currentTime >= riseTime && currentTime <= setTime
            : riseTime < setTime
                ? currentTime >= riseTime && currentTime <= setTime
                : currentTime >= riseTime || currentTime <= setTime;

        if (!isVisible) return { isVisible, progress: 0, currentPos: null };

        let totalDuration = 0;
        if (riseTime < setTime) {
            totalDuration = setTime.getTime() - riseTime.getTime();
        } else {
            totalDuration = (setTime.getTime() + 24 * 60 * 60 * 1000) - riseTime.getTime();
        }

        let elapsed = 0;
        if (currentTime >= riseTime) {
            elapsed = currentTime.getTime() - riseTime.getTime();
        } else {
            elapsed = (currentTime.getTime() + 24 * 60 * 60 * 1000) - riseTime.getTime();
        }

        elapsed = Math.max(0, Math.min(elapsed, totalDuration));
        const progress = totalDuration > 0 ? elapsed / totalDuration : 0;

        return { isVisible, progress, currentPos: progress };
    }, [currentTime, riseTime, setTime, isDaytimeCheck]);
};

const CelestialIcon = ({ type, x, y }: { type: 'sun' | 'moon', x: number, y: number }) => {
    if (type === 'sun') {
        return (
            <G>
                <Circle cx={x} cy={y} r={9} fill="white" />
                {Array.from({ length: 8 }).map((_, i) => {
                    const angle = (i * 360) / 8;
                    const innerRadius = 12;
                    const outerRadius = i % 2 === 0 ? 18 : 16;
                    const inner = polarToCartesian(x, y, innerRadius, angle);
                    const outer = polarToCartesian(x, y, outerRadius, angle);

                    return (
                        <Path
                            key={`sun-ray-${i}`}
                            d={`M${inner.x},${inner.y} L${outer.x},${outer.y}`}
                            stroke="white"
                            strokeOpacity={1}
                            strokeWidth={3}
                            strokeLinecap="round"
                        />
                    );
                })}
            </G>
        );
    }

    return (
        <G>
            <Circle cx={x} cy={y} r={15} fill="white" />
            <Circle cx={x - 5} cy={y - 4} r={4} fill="#a0a0a0" />
            <Circle cx={x + 6} cy={y + 5} r={3.5} fill="#a0a0a0" />
            <Circle cx={x + 5} cy={y - 6} r={3} fill="#a0a0a0" />
        </G>
    );
};

const GRADIENT_RANGES = [
    {
        startAngle: 0,
        endAngle: 90,
        colorStart: { r: 168, g: 208, b: 255 },
        colorEnd: { r: 60, g: 126, b: 207 },
    },
    {
        startAngle: 90,
        endAngle: 180,
        colorStart: { r: 60, g: 126, b: 207 },
        colorEnd: { r: 20, g: 74, b: 138 },
    },
];

export const SunMoonWidget: React.FC<SunMoonWidgetProps> =
    ({
         currentTime = new Date(),
     }) =>
{
    const weatherState = useAppSelector(x => x.weather);

    // TODO parse data from store
    const sunMoonData : SunMoonData = {
        sunrise: new Date(weatherState.data!.daily.sunrise[1]),
        sunset: new Date(weatherState.data!.daily.sunset[1]),
        moonrise: new Date(new Date().setHours(15, 46)),
        moonset: new Date(new Date().setHours(6, 50)),
        moonPhase:  weatherState.moonPhase!,
        uvIndex: weatherState.data!.hourly.uv_index[0]
    };

    const [currentTimeState, setCurrentTimeState] = useState(currentTime);
    const { sunrise, sunset, moonrise, moonset, moonPhase, uvIndex } = sunMoonData;

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTimeState(new Date());
        }, 60000);
        return () => clearInterval(interval);
    }, [currentTimeState]);

    const screenWidth = Dimensions.get('window').width;
    const svgWidth = screenWidth / 1.5;
    const topMargin = 55;
    const radius = 100;
    const centerX = svgWidth / 2;
    const centerY = radius + 20;
    const startAngle = 180;
    const endAngle = 0;

    const {
        isVisible: isSunVisible,
        progress: sunProgress,
        currentPos: sunPosProgress
    } = useCelestialBodyPosition(currentTimeState, sunrise, sunset, true);

    const {
        isVisible: isMoonVisible,
        progress: moonProgress,
        currentPos: moonPosProgress
    } = useCelestialBodyPosition(currentTimeState, moonrise, moonset, false);

    const showSun = isSunVisible;
    const showMoon = isMoonVisible && !showSun;
    const showSunDashedPath = showSun && !showMoon;
    const showMoonDashedPath = showMoon && !showSun;

    const sunStartPos = useMemo(() => polarToCartesian(centerX, centerY, radius, startAngle), [centerX, centerY, radius]);
    const sunEndPos = useMemo(() => polarToCartesian(centerX, centerY, radius, endAngle), [centerX, centerY, radius]);
    const sunCurrentPos = useMemo(() =>
            polarToCartesian(centerX, centerY, radius, startAngle - (sunPosProgress || 0) * 180),
        [centerX, centerY, radius, sunPosProgress]
    );

    const moonCurrentPos = useMemo(() =>
            polarToCartesian(centerX, centerY, radius, startAngle - (moonPosProgress || 0) * 180),
        [centerX, centerY, radius, moonPosProgress]
    );

    const semicirclePath = useMemo(() =>
            `M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`,
        [centerX, centerY, radius]
    );

    const clipPathId = useMemo(() => `clip-${Math.random().toString(36).substr(2, 9)}`, []);
    const moonClipPathId = useMemo(() => `moon-clip-${Math.random().toString(36).substr(2, 9)}`, []);

    return (
        <View
            className="flex mt-8 items-center relative overflow-hidden rounded-[35] w-full bg-[#45576170]/25"
            style={{ height: radius + centerY + 35 }}
        >

            <View className="absolute w-full h-full bg-[rgba(90,139,171,0.05)] rounded-[35]" />
            <Infolabel />
            <View style={{ marginTop: topMargin }} className="">
                <Svg width={svgWidth} height={centerY + 20}>
                    <Defs>
                        <LinearGradient id="sunGradient" x1="0.5" y1="0" x2="0.5" y2="1">
                            <Stop offset="0%" stopColor="#d9ecfc" stopOpacity="0.8" />
                            <Stop offset="100%" stopColor="white" stopOpacity="0" />
                        </LinearGradient>

                        <LinearGradient id="moonGradient" x1="0.5" y1="0" x2="0.5" y2="1">
                            <Stop offset="0%" stopColor="#e6e6e6" stopOpacity="0.8" />
                            <Stop offset="100%" stopColor="#a0a0a0" stopOpacity="0" />
                        </LinearGradient>

                        <ClipPath id={clipPathId} key={`${sunCurrentPos.x}-${sunCurrentPos.y}`}>
                            <Path d={`M ${centerX - radius} ${centerY - radius} L ${sunCurrentPos.x} ${centerY - radius} L ${sunCurrentPos.x} ${centerY + radius} L ${centerX - radius} ${centerY + radius} Z`} />
                        </ClipPath>
                        <ClipPath id={`clip-dash-${clipPathId}`}>
                            <Path
                                d={`
                                    M ${sunCurrentPos.x} ${centerY - radius}
                                    L ${centerX + radius} ${centerY - radius}
                                    L ${centerX + radius} ${centerY + radius}
                                    L ${sunCurrentPos.x} ${centerY + radius}
                                    Z
                                `}
                            />
                        </ClipPath>

                        <ClipPath id={moonClipPathId} key={`${moonCurrentPos.x}-${moonCurrentPos.y}`}>
                            <Path d={`M ${centerX - radius} ${centerY - radius} L ${moonCurrentPos.x} ${centerY - radius} L ${moonCurrentPos.x} ${centerY + radius} L ${centerX - radius} ${centerY + radius} Z`} />
                        </ClipPath>
                        <ClipPath id={`moon-clip-dash-${moonClipPathId}`}>
                            <Path
                                d={`
                                    M ${moonCurrentPos.x} ${centerY - radius}
                                    L ${centerX + radius} ${centerY - radius}
                                    L ${centerX + radius} ${centerY + radius}
                                    L ${moonCurrentPos.x} ${centerY + radius}
                                    Z
                                `}
                            />
                        </ClipPath>
                    </Defs>

                    {/* Sun path */}
                    {showSun && (
                        <>
                            <Path
                                d={semicirclePath}
                                fill="url(#sunGradient)"
                                clipPath={`url(#${clipPathId})`}
                            />
                            {showSunDashedPath && (
                                <Path
                                    d={semicirclePath}
                                    stroke="white"
                                    strokeOpacity={0.7}
                                    strokeWidth={2}
                                    strokeDasharray="5"
                                    strokeLinecap="round"
                                    fill="none"
                                    clipPath={`url(#clip-dash-${clipPathId})`}
                                />
                            )}
                            <RingWithGradient
                                radiusInner={98}
                                radiusOuter={102}
                                startAngle={0}
                                endAngle={180 * sunProgress}
                                cx={centerX}
                                cy={centerY}
                                segments={180}
                                opacity={0.5}
                                rotationDeg={-90}
                                gradientRanges={GRADIENT_RANGES}
                            />
                        </>
                    )}

                    {/* Moon path */}
                    {showMoon && (
                        <>
                            <Path
                                d={semicirclePath}
                                fill="url(#sunGradient)"
                                clipPath={`url(#${moonClipPathId})`}
                            />
                            {showMoonDashedPath && (
                                <Path
                                    d={semicirclePath}
                                    stroke="white"
                                    strokeOpacity={0.7}
                                    strokeWidth={2}
                                    strokeDasharray="5"
                                    strokeLinecap="round"
                                    fill="none"
                                    clipPath={`url(#moon-clip-dash-${moonClipPathId})`}
                                />
                            )}
                            <RingWithGradient
                                radiusInner={98}
                                radiusOuter={102}
                                startAngle={0}
                                endAngle={180 * moonProgress}
                                cx={centerX}
                                cy={centerY}
                                segments={180}
                                opacity={0.5}
                                rotationDeg={-90}
                                gradientRanges={GRADIENT_RANGES}
                            />
                        </>
                    )}

                    {/* Position markers */}
                    <Circle cx={sunStartPos.x} cy={sunStartPos.y} r={6} fill="white" opacity={1} />
                    <Circle cx={sunEndPos.x} cy={sunEndPos.y} r={6} fill="white" opacity={1} />

                    {/* Celestial bodies */}
                    {showSun && <CelestialIcon type="sun" x={sunCurrentPos.x} y={sunCurrentPos.y} />}
                    {showMoon && <CelestialIcon type="moon" x={moonCurrentPos.x} y={moonCurrentPos.y} />}
                </Svg>
            </View>

            {/* Center display - UV Index or Moon Phase */}
            <View className="absolute top-1/2 left-1/2" style={{
                transform: [{ translateX: -30 }, { translateY: -30 }],
                width: 60,
                height: 60,
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {showSun ? (
                    <>
                        <Text className="text-white font-poppins-bold text-2xl">
                            {uvIndex !== undefined ? uvIndex : '—'}
                        </Text>
                        <Text className="text-gray-100/60 font-manrope-bold text-[12px]">
                            {t('sunMoon.uvIndex')}
                        </Text>
                    </>
                ) : showMoon ? (
                    <View className="items-center mt-8">
                        <Text className="text-gray-100/60 font-manrope-semibold w-full text-[12px] mt-1">
                            {getMoonPhaseText(moonPhase)}
                        </Text>
                    </View>
                ) : null}
            </View>

            <View className="w-full absolute bottom-[78] bg-white/20 h-0.5" />
            <View className="flex flex-col absolute bottom-6 left-5">
                <Text className="text-gray-100/60 font-manrope-bold text-[14px] leading-5">
                    {showSun ? t('sunMoon.sunrise') : showMoon ? t('sunMoon.moonrise') : t('sunMoon.noData')}
                </Text>
                <Text className="text-white font-poppins-bold text-[14px] leading-5">
                    {showSun ? formatTime(sunrise) : showMoon ? formatTime(moonrise) : '—'}
                </Text>
            </View>
            <View className="flex flex-col absolute bottom-6 right-5 items-end">
                <Text className="text-gray-100/60 font-manrope-bold text-[14px] leading-5">
                    {showSun ? t('sunMoon.sunset') : showMoon ? t('sunMoon.moonset') : t('sunMoon.noData')}
                </Text>
                <Text className="text-white font-poppins-bold text-[14px] leading-5">
                    {showSun ? formatTime(sunset) : showMoon ? formatTime(moonset) : '—'}
                </Text>
            </View>
            <Feather name="arrow-up" className="left-5 bottom-24 absolute" size={34} color="white" />
            <Feather name="arrow-down" className="right-5 bottom-24 absolute" size={34} color="white"/>
        </View>
    );
};