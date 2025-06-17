import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Switch,
  StyleSheet,
  TouchableOpacity
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { CLocation, Trip } from "@/src/interface/interface_detail";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import ResultSuggested from "./ResultSuggested";

export interface SuggestedDetails {
  startDateTime: string;
  tripId: string;
  useDistance: boolean;
  useDuration: boolean;
  visitingTime: {
    [key: string]: number;
  };
}

interface FormSuggestedProps {
  tripId: string;
  numVisitPlaces:  CLocation[];
  handleSubmitChange: (trip: Trip) => void;
}

const FormSuggested = ({ tripId, numVisitPlaces, handleSubmitChange }: FormSuggestedProps) => {
  useTheme();
  const [startDateTime, setStartDateTime] = useState(new Date());

  const [useDistance, setUseDistance] = useState(true);
  const [useDuration, setUseDuration] = useState(true);

  const [visitingTime, setVisitingTime] = useState<{ [key: string]: string }>({});
  const [input, setInput] = useState<SuggestedDetails|null>(null);

  // Tạo visitingTime rỗng theo số địa điểm
  useEffect(() => {
    const initial: { [key: string]: string } = {};
    for (let i = 1; i <= numVisitPlaces.length; i++) {
      initial[i.toString()] = "0";
    }
    setVisitingTime(initial);
  }, [numVisitPlaces]);

  const onDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (selectedDate) setStartDateTime(selectedDate);
  };

  const onTimeChange = (
    key: string,
    event: DateTimePickerEvent,
    selectedTime?: Date,
  ) => {
    if (event.type === "set" && selectedTime) {
      const totalMinutes =
        selectedTime.getHours() * 60 + selectedTime.getMinutes();
      setVisitingTime((prev) => ({
        ...prev,
        [key]: totalMinutes.toString(),
      }));
    }
    console.log(selectedTime);
  };

  const handleSubmit = () => {
    const payload = {
      tripId,
      startDateTime: startDateTime.toISOString().split("T")[0],
      useDistance,
      useDuration,
      visitingTime: Object.fromEntries(
        Object.entries(visitingTime).map(([k, v]) => [k, parseInt(v) || 0])
      ),
    };
    setInput(payload);
  };

  return (
    <View style={styles.container}>
    {input? (
        <ResultSuggested input={input} handleSubmitChange={handleSubmitChange}/>
    ) : (
    <ScrollView contentContainerStyle={{ padding: 16, width: '100%', height: '90%', marginTop: 100 }}>
      {/* Ngày bắt đầu */}
      <Text style={[{ fontWeight: "bold", fontSize: 16, color: Color.textPrimary }]}>Ngày bắt đầu</Text>
      <DateTimePicker
        style={{alignSelf: 'center'}}
        value={startDateTime}
        mode={"date"}
        display="default"
        is24Hour={true}
        onChange={onDateChange}
        accentColor={Color.mainColor2}
      />
      <View style={{ marginTop: 16 }}>
        <Text style={[{ fontWeight: "bold", fontSize: 16, color: Color.textPrimary }]}>Tùy chọn:</Text>

        <View style={styles.item}>
          <Text style={{ color: Color.textPrimary }}>Ưu tiên khoảng cách</Text>
          <Switch
            value={useDistance}
            onValueChange={setUseDistance}
            trackColor={{ false: Color.textSecondary, true: Color.mainColor2 }}
            thumbColor={useDistance ? Color.mainColor2 : Color.backgroundTertiary}
          />
        </View>

        <View style={styles.item}>
          <Text style={{ color: Color.textPrimary }}>Ưu tiên thời gian</Text>
          <Switch
            value={useDuration}
            onValueChange={setUseDuration}
            trackColor={{ false: Color.textSecondary, true: Color.mainColor2 }}
            thumbColor={useDuration ? Color.mainColor2 : Color.backgroundTertiary}
          />
        </View>
      </View>

      {/* Visiting Time */}
      <Text style={[{ fontWeight: "bold", fontSize: 15, marginTop: 20, color: Color.textPrimary }]}>
        Thời gian tham quan từng địa điểm (giờ : phút)
      </Text>

      {Object.entries(visitingTime).map(([key, value]) => {
        const totalMinutes = parseInt(value, 10);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        // Tạo đối tượng Date
        const tempTime = new Date();
        tempTime.setHours(hours);
        tempTime.setMinutes(minutes);
        tempTime.setSeconds(0);
        tempTime.setMilliseconds(0);

        return (
          <View key={key} style={styles.item}>
            <Text style={[{maxWidth: '70%', color: Color.textPrimary}]}>{numVisitPlaces[parseInt(key) - 1]?.displayName || `Địa điểm ${key}`}</Text>
            <DateTimePicker
              mode="time"
              display="default"
              is24Hour={true}
              value={tempTime} // Sử dụng tempTime đã được chuyển đổi
              onChange={(event, selectedTime) => {onTimeChange(key, event, selectedTime)}}
              accentColor={Color.mainColor2} // For iOS
            />
          </View>
        );
      })}

      <View style={styles.boxSubmit}>
        <TouchableOpacity style={[styles.send, { backgroundColor: Color.mainColor2 }]} onPress={handleSubmit}>
            <Text style={[styles.textSend, { color: Color.textOnMain2 }]}>Gửi dữ liệu</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    )}
    </View>
  );
};

const styles = StyleSheet.create({
    item: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: 'space-between',
        marginTop: 8,
    },
    send: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Color.mainColor2,
        padding: 20,
        borderRadius: 20
    },
    textSend: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Color.textOnMain2 // Changed to textOnMain2
    },
    boxSubmit: {
        position: 'absolute',
        alignSelf: 'center',
        bottom: 50, width: 300,
    },
    container: {
        width: '100%',
        height: '100%'
    }
})
export default FormSuggested;