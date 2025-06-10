// src/styles/Color.ts
export interface Color {


    mainColor1: string;
    mainColor2: string;
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
    black_black:string;
}

export const lightColor: Color = {
    mainColor2: "#4B164C",
    mainColor1: "#DD88CF",

    background: "#FFFFFF", // Nền trắng tinh khiết
    backgroundSecondary: "#F0F0F0", // Nền phụ nhạt (ví dụ: cho các khối, thẻ)
    backgroundTertiary: "#E0E0E0", // Nền nhạt hơn nữa (ví dụ: cho input, hover)
    backgroundSelected: '#E0F2F1',
    // Màu chữ
    textPrimary: "#212121", // Chữ chính màu đen gần như thuần túy để tương phản cao
    textSecondary: "#616161", // Chữ phụ, mô tả (ví dụ: chú thích)
    textTertiary: "#9E9E9E", // Chữ ít quan trọng hơn, placeholder
    textOnMain1: "#FFFFFF", // Chữ trên mainColor2 (màu trắng)
    textOnMain2: "#4B164C", // Chữ trên mainColor2 (màu tím đậm của mainColor2)
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
