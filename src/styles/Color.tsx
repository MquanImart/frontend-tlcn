//import { AsyncStorage } from "react-native"

interface Color {
    white_homologous: string;
    white_contrast: string;
    mainColor1: string;
    mainColor2: string;
    backGround: string;
    backGround1: string;
    backGround2: string,
    backGround3: string,
    backGround4: string,
    textColor1: string;
    textColor2: string;
    textColor3: string;
    textColor4: string;
    textColor5: string;
    borderColor1: string;
    borderColorwb: string;
    inputBackGround: string;
}

const lightColor : Color = {
    white_homologous: "#fff",
    white_contrast: "#000",
    mainColor1: "#4B164C",
    mainColor2: "#DD88CF",
    backGround: "#fff",
    backGround1: "#e9e9e9",
    backGround2: "#f0f0f0",
    backGround3: "#ffffff30",
    backGround4: "#50A7E7",
    textColor1: "#000",
    textColor2: "#fff",
    textColor3: "#A5ACB8",
    textColor4: "#3d3d3d",
    textColor5: "#FCF3FA",
    borderColor1: "#A5ACB8",
    borderColorwb: "#000",
    inputBackGround: "#F0F0F0" // Màu xám nhạt
}

const darkColor : Color = {
    white_homologous: "#000",
    white_contrast: "#fff",
    mainColor1: "#4B164C",
    mainColor2: "#4B164C",
    backGround: "#000",
    backGround1: "#161616",
    backGround2: "#0a0a0a",
    backGround3: "#ffffff30",
    backGround4: "#50A7E7",
    textColor1: "#fff",
    textColor2: "#000",
    textColor3: "#fff",
    textColor4: "#3d3d3d",
    textColor5: "#FCF3FA",
    borderColor1: "#A5ACB8",
    borderColorwb: "#fff",
    inputBackGround: "#F0F0F0" 
}

const getColor = () => {
    const modeColor = true; // await AsyncStorage.getItem("");
    if (!modeColor || modeColor){
        return lightColor;
    } else {
        return darkColor;
    }
}

export default getColor;