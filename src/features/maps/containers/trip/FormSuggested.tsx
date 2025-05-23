import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  ScrollView,
  Switch,
  StyleSheet,
  TouchableOpacity
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { CLocation } from "@/src/interface/interface_detail";
import getColor from "@/src/styles/Color";
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
}

const FormSuggested = ({ tripId, numVisitPlaces }: FormSuggestedProps) => {
  const [startDateTime, setStartDateTime] = useState(new Date());
  const [useTime, setUseTime] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);

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
    setShowDatePicker(false);
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
      startDateTime: useTime
        ? startDateTime.toISOString()
        : startDateTime.toISOString().split("T")[0],
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
        <ResultSuggested input={input}/>
    ) : (
    <ScrollView contentContainerStyle={{ padding: 16, width: '100%', height: '100%' }}>
      {/* Ngày bắt đầu */}
      <Text style={{ fontWeight: "bold", fontSize: 16 }}>Ngày bắt đầu</Text>
      <View style={styles.item}>
        <Text>Thêm giờ bắt đầu</Text>
        <Switch value={useTime} onValueChange={setUseTime} />
      </View>
      <Button
        title={
          useTime
            ? startDateTime.toLocaleString()
            : startDateTime.toDateString()
        }
        onPress={() => setShowDatePicker(true)}
      />
      {showDatePicker && (
        <DateTimePicker
          value={startDateTime}
          mode={useTime ? "datetime" : "date"}
          display="default"
          is24Hour={true}
          onChange={onDateChange}
        />
      )}

      <View style={{ marginTop: 16 }}>
        <Text style={{ fontWeight: "bold", fontSize: 16 }}>Tùy chọn:</Text>

        <View style={styles.item}>
          <Text>Ưu tiên khoảng cách</Text>
          <Switch value={useDistance} onValueChange={setUseDistance} />
        </View>

        <View style={styles.item}>
          <Text>Ưu tiên thời gian</Text>
          <Switch value={useDuration} onValueChange={setUseDuration} />
        </View>
      </View>

      {/* Visiting Time */}
      <Text style={{ fontWeight: "bold", fontSize: 15, marginTop: 20 }}>
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
            <Text style={{maxWidth: '70%'}}>{numVisitPlaces[parseInt(key) - 1]?.displayName || `Địa điểm ${key}`}</Text>
            <DateTimePicker
              mode="time"
              display="default"
              is24Hour={true}
              value={tempTime} // Sử dụng tempTime đã được chuyển đổi
              onChange={(event, selectedTime) => {onTimeChange(key, event, selectedTime)}}
            />
          </View>
        );
      })}

      <View style={styles.boxSubmit}>
        <TouchableOpacity style={styles.send} onPress={handleSubmit}>
            <Text style={styles.textSend}>Gửi dữ liệu</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    )}
    </View>
  );
};

const Color = getColor();
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
        backgroundColor: Color.mainColor1,
        padding: 20,
        borderRadius: 20
    },
    textSend: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Color.white_homologous
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
