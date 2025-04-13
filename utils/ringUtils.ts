export const describeFullRing = (
    cx: number,
    cy: number,
    rOuter: number,
    rInner: number
): string => {
    return `
        M ${cx + rOuter},${cy}
        A ${rOuter},${rOuter} 0 1 1 ${cx - rOuter},${cy}
        A ${rOuter},${rOuter} 0 1 1 ${cx + rOuter},${cy}
        Z
        M ${cx + rInner},${cy}
        A ${rInner},${rInner} 0 1 0 ${cx - rInner},${cy}
        A ${rInner},${rInner} 0 1 0 ${cx + rInner},${cy}
        Z
    `;
};

export const describeRingSector = (
    cx: number,
    cy: number,
    rOuter: number,
    rInner: number,
    startAngleDeg: number,
    endAngleDeg: number,
    rotationDeg: number = 0,
    rounded: boolean = false
): string => {
    const toRad = (deg: number) => (Math.PI / 180) * deg;

    const adjustedStart = startAngleDeg + rotationDeg;
    const adjustedEnd = endAngleDeg + rotationDeg;

    const startRad = toRad(adjustedStart - 90);
    const endRad = toRad(adjustedEnd - 90);

    const x1 = cx + rOuter * Math.cos(startRad);
    const y1 = cy + rOuter * Math.sin(startRad);
    const x2 = cx + rOuter * Math.cos(endRad);
    const y2 = cy + rOuter * Math.sin(endRad);
    const x3 = cx + rInner * Math.cos(endRad);
    const y3 = cy + rInner * Math.sin(endRad);
    const x4 = cx + rInner * Math.cos(startRad);
    const y4 = cy + rInner * Math.sin(startRad);

    const largeArcFlag = endAngleDeg - startAngleDeg <= 180 ? "0" : "1";

    if (rounded) {
        return `
            M ${x1},${y1}
            A ${rOuter},${rOuter} 0 ${largeArcFlag} 1 ${x2},${y2}
            A 1,1 0 0 1 ${x3},${y3}
            A ${rInner},${rInner} 0 ${largeArcFlag} 0 ${x4},${y4}
            A 1,1 0 0 1 ${x1},${y1}
            Z
        `;
    }

    return `
        M ${x1},${y1}
        A ${rOuter},${rOuter} 0 ${largeArcFlag} 1 ${x2},${y2}
        L ${x3},${y3}
        A ${rInner},${rInner} 0 ${largeArcFlag} 0 ${x4},${y4}
        Z
    `;
};
