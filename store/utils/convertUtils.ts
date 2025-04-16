import {TemperatureUnit, WindSpeedUnit} from "../types/types";

const FAHRENHEIT_SCALE = 9 / 5;
const FAHRENHEIT_OFFSET = 32;

const MPS_TO_KMH = 3.6;
const MPH_TO_KMH = 1.60934;

function round(value: number, decimals: number = 1): number {
    return Number(value.toFixed(decimals));
}

export const convertTemperature = (
    value: number,
    from: TemperatureUnit,
    to: TemperatureUnit
): number =>
{
    if (from === to) return value;

    if (from === "°C" && to === "°F") {
        return round(value * FAHRENHEIT_SCALE + FAHRENHEIT_OFFSET);
    }

    if (from === "°F" && to === "°C") {
        return round((value - FAHRENHEIT_OFFSET) * (5 / 9));
    }

    return value;
};

export const convertWindSpeed = (
    value: number,
    from: WindSpeedUnit,
    to: WindSpeedUnit
): number => {
    if (from === to) return value;

    let valueInKmh = value;
    if (from === "m/s") {
        valueInKmh = value * MPS_TO_KMH;
    } else if (from === "mph") {
        valueInKmh = value * MPH_TO_KMH;
    }

    if (to === "km/h") {
        return round(valueInKmh);
    } else if (to === "m/s") {
        return round(valueInKmh / MPS_TO_KMH);
    } else if (to === "mph") {
        return round(valueInKmh / MPH_TO_KMH);
    }

    return value;
};