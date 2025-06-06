export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  boldRanges?: Array<{ start: number; end: number }>; // Lưu vị trí các đoạn cần in đậm
}