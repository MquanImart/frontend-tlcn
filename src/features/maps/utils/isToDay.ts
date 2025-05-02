export const isToday = (dayIndex: number, currentDate: Date = new Date()) => {
    const today = currentDate.getDay(); // 0 = Chủ nhật, 1 = Thứ Hai, ...
    // weekdayDescriptions: [Monday, Tuesday, ..., Sunday] -> cần ánh xạ
    const adjustedDayIndex = (dayIndex + 1) % 7; // Monday = 1, Sunday = 0
    return today === adjustedDayIndex;
  };