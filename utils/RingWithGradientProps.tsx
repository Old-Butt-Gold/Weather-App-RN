import React from 'react';
import { Path } from 'react-native-svg';

interface RingWithGradientProps {
    radiusInner: number;
    radiusOuter: number;
    startAngle: number;
    endAngle: number;
    segments?: number;
    gradientRanges: {
        startAngle: number;
        endAngle: number;
        colorStart: { r: number; g: number; b: number };
        colorEnd: { r: number; g: number; b: number };
    }[];
    defaultColor?: string;
    opacity?: number;
    cx?: number; // Центр по X
    cy?: number; // Центр по Y
    rotationDeg?: number; // Новый параметр для поворота сектора
}

const RingWithGradient: React.FC<RingWithGradientProps> = ({
                                                               radiusInner,
                                                               radiusOuter,
                                                               startAngle,
                                                               endAngle,
                                                               segments = 200,
                                                               gradientRanges,
                                                               defaultColor = "gray",
                                                               opacity = 1,
                                                               cx = 50, // По умолчанию 50
                                                               cy = 50,
                                                               rotationDeg = 0, // По умолчанию 0
                                                           }) => {
    const toRad = (deg: number) => (Math.PI / 180) * deg;

    const getColor = (angle: number): string => {
        for (let range of gradientRanges) {
            const { startAngle, endAngle, colorStart, colorEnd } = range;
            if (angle >= startAngle && angle <= endAngle) {
                const t = (angle - startAngle) / (endAngle - startAngle);
                const r = Math.round(colorStart.r + t * (colorEnd.r - colorStart.r));
                const g = Math.round(colorStart.g + t * (colorEnd.g - colorStart.g));
                const b = Math.round(colorStart.b + t * (colorEnd.b - colorStart.b));
                return `rgb(${r},${g},${b})`;
            }
        }
        return defaultColor;
    };

    const describeRingSegment = (
        cx: number,
        cy: number,
        innerRadius: number,
        outerRadius: number,
        angleStartDeg: number,
        angleEndDeg: number,
        rotationDeg: number
    ) => {
        const adjustedStart = angleStartDeg + rotationDeg;
        const adjustedEnd = angleEndDeg + rotationDeg;

        const startRad = toRad(adjustedStart - 90);
        const endRad = toRad(adjustedEnd - 90);

        const x1 = cx + outerRadius * Math.cos(startRad);
        const y1 = cy + outerRadius * Math.sin(startRad);
        const x2 = cx + outerRadius * Math.cos(endRad);
        const y2 = cy + outerRadius * Math.sin(endRad);
        const x3 = cx + innerRadius * Math.cos(endRad);
        const y3 = cy + innerRadius * Math.sin(endRad);
        const x4 = cx + innerRadius * Math.cos(startRad);
        const y4 = cy + innerRadius * Math.sin(startRad);

        const largeArcFlag = adjustedEnd - adjustedStart <= 180 ? '0' : '1';

        return `
      M ${x1},${y1}
      A ${outerRadius},${outerRadius} 0 ${largeArcFlag} 1 ${x2},${y2}
      L ${x3},${y3}
      A ${innerRadius},${innerRadius} 0 ${largeArcFlag} 0 ${x4},${y4}
      Z
    `;
    };

    const segmentsArray = Array.from({ length: segments }, (_, i) => {
        const angle1 = startAngle + ((endAngle - startAngle) * i) / segments;
        const angle2 = startAngle + ((endAngle - startAngle) * (i + 1)) / segments;

        const path = describeRingSegment(cx, cy, radiusInner, radiusOuter, angle1, angle2, rotationDeg);
        const fill = getColor((angle1 + angle2) / 2);

        return <Path key={i} d={path} fill={fill} opacity={opacity} />;
    });

    return <>{segmentsArray}</>;
};

export default RingWithGradient;