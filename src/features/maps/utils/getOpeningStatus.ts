import { RegularOpeningHours } from "../containers/interfaceAPI";

// utils.ts
export const getOpeningStatus = (openingHours: RegularOpeningHours, currentDate: Date = new Date()) => {
  const now = currentDate;
  const nextCloseTime = new Date(openingHours.nextCloseTime);

  if (openingHours.openNow) {
    return {
      status: "Đang mở",
      nextEvent: `Đóng lúc ${nextCloseTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
    };
  } else {
    // Tìm thời gian mở tiếp theo
    const currentDay = now.getDay(); // 0 = Chủ nhật, 1 = Thứ Hai, ...
    const periods = openingHours.periods;
    let nextOpenTime: Date | null = null;

    for (let i = 0; i < 7; i++) {
      const dayToCheck = (currentDay + i) % 7;
      const period = periods.find((p) => p.open.day === dayToCheck);
      if (period) {
        const openTime = new Date(now);
        openTime.setDate(now.getDate() + i);
        openTime.setHours(period.open.hour, period.open.minute, 0, 0);

        if (openTime > now) {
          nextOpenTime = openTime;
          break;
        }
      }
    }

    return {
      status: "Đang đóng",
      nextEvent: nextOpenTime
        ? `Mở lúc ${nextOpenTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ngày ${nextOpenTime.toLocaleDateString()}`
        : "Không có lịch mở trong tuần này",
    };
  }
};