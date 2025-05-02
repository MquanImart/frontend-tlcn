import { DimensionValue } from "react-native";

const ConvertDimension = (value: number | string): DimensionValue => {
    if (typeof value === "number") {
        return value;
    }
    return value as DimensionValue;
};

export default ConvertDimension;