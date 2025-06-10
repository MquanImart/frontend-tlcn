// src/styles/Color.ts
export interface Color {
    white: string;
    black: string;
    gray1: string;
    gray2: string;
    gray3: string;
    gray4: string;
    red_red: string;


    white_homologous: string;
    white_contrast: string;
    backGround: string;
    backGround1: string;
    backGround2: string;
    backGround3: string;
    textColor1: string;
    textColor2: string;
    textColor3: string;
    textColor4: string;
    borderColor1: string;
    borderColorwb: string;
    inputBackGround: string;

    mainColor2: string;
    mainColor1: string;
    background: string;
    backgroundSecondary: string;
    backgroundTertiary:string;
    backgroundSelected: string;
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
    textOnMain1: string;
    textOnMain2: string;
    border: string;
    success: string;
    error: string;
    warning: string;
    shadow: string; 
    white_white: string;
    black_black: string;
}

export const lightColor: Color = {
    mainColor2: "#4B164C",
    mainColor1: "#DD88CF",
    white: "#fff",
    black: "#000",
    gray1: "#f0f0f0",
    gray2: "#e9e9e9",
    gray3: "#9E9E9E",
    gray4: "#3d3d3d",
    red_red: "#ff0000",


    white_homologous: "#fff",
    white_contrast: "#000",
    backGround: "#fff",
    backGround1: "#e9e9e9",
    backGround2: "#f0f0f0",
    backGround3: "#50A7E7",
    textColor1: "#000",
    textColor2: "#fff",
    textColor3: "#A5ACB8",
    textColor4: "#3d3d3d",
    borderColor1: "#A5ACB8",
    borderColorwb: "#000",
    inputBackGround: "#F0F0F0",

    background: "#FFFFFF", // Nền trắng tinh khiết
    backgroundSecondary: "#F0F0F0", // Nền phụ nhạt (ví dụ: cho các khối, thẻ)
    backgroundTertiary: "#E0E0E0", // Nền nhạt hơn nữa (ví dụ: cho input, hover)
    backgroundSelected: '#E0F2F1',
    // Màu chữ
    textPrimary: "#212121", // Chữ chính màu đen gần như thuần túy để tương phản cao
    textSecondary: "#616161", // Chữ phụ, mô tả (ví dụ: chú thích)
    textTertiary: "#9E9E9E", // Chữ ít quan trọng hơn, placeholder
    textOnMain1: "#FFFFFF", // Chữ trên mainColor2 (màu trắng)
    textOnMain2: "#fff", // Chữ trên mainColor2 (màu tím đậm của mainColor2)
    // Màu viền
    border: "#BDBDBD", // Viền chung
    // Màu trạng thái (ví dụ: success, error, warning)
    success: "#4CAF50",
    error: "#F44336",
    warning: "#FFC107",
    shadow: "rgba(0, 0, 0, 0.15)", // Bóng đổ cho theme sáng
    white_white: "#FFFFFF",
    black_black: "#000000"
};

export const darkColor: Color = {
    mainColor2: "#DD88CF",
    mainColor1: "#4B164C",
    white: "#000",
    black: "#fff",
    gray1: "#3d3d3d",
    gray2: "#9E9E9E",
    gray3: "#e9e9e9",
    gray4: "#F0F0F0",
    red_red: "#ff0000",


    white_homologous: "#000",
    white_contrast: "#fff",
    backGround: "#000",
    backGround1: "#161616",
    backGround2: "#0a0a0a",
    backGround3: "#50A7E7",
    textColor1: "#fff",
    textColor2: "#000",
    textColor3: "#fff",
    textColor4: "#3d3d3d",
    borderColor1: "#A5ACB8",
    borderColorwb: "#fff",
    inputBackGround: "#F0F0F0",


    background: "#121212", // Nền rất đậm (gần như đen)
    backgroundSecondary: "#1E1E1E", // Nền phụ đậm hơn một chút
    backgroundTertiary: "#2C2C2C", // Nền đậm hơn nữa (ví dụ: cho input, hover)
    backgroundSelected: '#363738',
    // Màu chữ
    textPrimary: "#E0E0E0", // Chữ chính màu trắng nhạt để tương phản tốt
    textSecondary: "#A0A0A0", // Chữ phụ, mô tả
    textTertiary: "#757575", // Chữ ít quan trọng hơn, placeholder
    textOnMain1: "#121212", // Chữ trên mainColor2 (màu nền đậm)
    textOnMain2: "#E0E0E0", // Chữ trên mainColor2 (màu trắng nhạt của textPrimary)
    // Màu viền
    border: "#424242", // Viền chung
    // Màu trạng thái (ví dụ: success, error, warning)
    success: "#81C784", // Sáng hơn để nổi bật trên nền tối
    error: "#E57373", // Sáng hơn
    warning: "#FFD54F", // Sáng hơn
    shadow: "rgba(0, 0, 0, 0.3)",
    white_white: "#FFFFFF",
    black_black: "#000000"
};
