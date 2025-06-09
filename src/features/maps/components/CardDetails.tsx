import CIconButton from "@/src/shared/components/button/CIconButton";
import restClient from "@/src/shared/services/RestClient";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import DetailsImages from "../components/DetailsImages";
import { PlaceData } from "../containers/interfaceAPI";
import { LocationProps } from "../containers/useMap";
import { getOpeningStatus } from "../utils/getOpeningStatus";
import { isToday } from "../utils/isToDay";

const tabsMap = [
    {label: 'Đường đi', icon: 'place'},
    {label: 'Lưu', icon: 'turned-in-not'},
    {label: 'Chuyến đi', icon: 'add'}
]

interface CardDetailsProps {
    details: PlaceData | null;
    location: LocationProps | null;
    closeDetails: () => void;
    pressDirection: () => void;
}

const CardDetails = ({details, location, closeDetails, pressDirection}: CardDetailsProps) => {
  useTheme();
  const currentDate = new Date(Date.now());
  const [saved, setSaved] = useState<boolean | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    setSaved(false);
    checkSavedLocation();
  }, [details]);

  const handlePressTab = (label: string) => {
    if (label=== tabsMap[0].label){
      pressDirection();
    } else if (label=== tabsMap[1].label){
      if (saved){
        deleteLocation();
      } else {
        savedLocation();
      }
    }
  }

  const savedLocation = async () => {
    const userId = await AsyncStorage.getItem("userId");
    if (userId && details){
      const mapAPI = restClient.apiClient.service(`apis/users/${userId}/add-saved-location`);
      const result = await mapAPI.create({
        displayName: details.displayName.text,
        placeId: "",
        latitude: details.location.latitude,
        longitude: details.location.longitude,
        address: details.formattedAddress
      })
      if (result.success){
        setSaved(true);
      }
    }
  }

  const deleteLocation = async () => {
    const userId = await AsyncStorage.getItem("userId");
    if (userId && details){
      const mapAPI = restClient.apiClient.service(`apis/users/${userId}/delete-saved-location`);
      const result = await mapAPI.delete({savedId: savedId})
      if (result.success){
        setSaved(false);
      }
    }
  }
  
  const checkSavedLocation = async () => {
    const userId = await AsyncStorage.getItem("userId");
    if (userId && details){
      const mapAPI = restClient.apiClient.service(`apis/users/${userId}/check-saved-location`);
      const result = await mapAPI.create({
        location: details.location
      })
      if (result.success && result.saved){
        setSaved(true);
        setSavedId(result.savedLocation._id)
      } else {
        setSaved(false);
      }
    }
  }

  if (saved === null || !location) return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator/></View>
  const openingInfo = details && details.regularOpeningHours ? getOpeningStatus(details.regularOpeningHours) : null;
  const status = openingInfo ? openingInfo.status : "Không có thông tin";
  const nextEvent = openingInfo ? openingInfo.nextEvent : "Không có thông tin";

  return (
      <View style={styles.container}>
          <View style={styles.actions}>
            <Text style={styles.name}>{details? details.displayName.text : `${location.latitude} , ${location.longitude}`}</Text>
            <CIconButton icon={<Icon name={'clear'} size={20} color={Color.white_contrast}/>} 
                  onSubmit={closeDetails} 
                  style={{
                      width: 50,
                      height: 50,
                      fontSize: 13,
                      radius: 50,
                      flex_direction: 'row'
                  }}
              />
          </View>
          <ScrollView showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
            <View style={styles.actions}>
            {tabsMap.map((item, index) => 
                <CIconButton key={index} icon={<Icon name={item.icon} size={15} color={index === 0 ? Color.white_homologous : Color.white_contrast}/>} 
                    label={" " + (index === 1 && saved? "Đã lưu": item.label)}
                    onSubmit={() => {handlePressTab(item.label)}} 
                    style={{
                        width: 110,
                        height: 35,
                        backColor: index === 0 ? Color.mainColor1 : undefined,
                        textColor: index === 0 ? Color.textColor2 : undefined,
                        fontSize: 13,
                        radius: 50,
                        flex_direction: 'row',
                        shadow: true
                    }}
                />
            )}
            </View>
            {details && <DetailsImages details={details}/>}
            <View style={styles.line}/>
            {status && nextEvent && 
            <View style={styles.boxinfo}>
              <View style={styles.clock}>
                <Icon name={'alarm'} size={25} color={Color.white_contrast}/>
                <Text style={styles.textClock}>{status}</Text>
              </View>
              <Text style={styles.textClock}>{nextEvent}</Text>
            </View>}
            <View style={styles.line}/>
            <View style={styles.boxTable}>
            <Text style={styles.tableTitle}>Thời khóa biểu trong tuần</Text>
            <View style={styles.tableHeader}>
              <Text style={styles.headerText}>Ngày</Text>
              <Text style={styles.headerText}>Giờ hoạt động</Text>
            </View>
            <View style={styles.boxinfo}>
              <Icon name={'place'} size={25} color={Color.white_contrast}/>
              <Text style={styles.textStart}>{`${location.latitude} , ${location.longitude}`}</Text>
            </View>
            {details && details.regularOpeningHours && details.regularOpeningHours.weekdayDescriptions.map((item, index) => {
              const today = isToday(index, currentDate);
              return (
                <View key={`schedule-${index}`} style={[styles.tableRow, today && styles.todayRow]}>
                  <Text style={[styles.dayText, today && styles.todayText]}>
                    {item.split(":")[0]} {/* Lấy tên ngày */}
                  </Text>
                  <Text style={[styles.timeText, today && styles.todayText]}>
                    {item.split(": ")[1]?.trim() || "Closed"} {/* Lấy giờ */}
                  </Text>
                </View>
              );
            })}
            </View>
          </ScrollView>
      </View>
  )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    name: {
      color: Color.textColor1,
      fontSize: 20,
      fontWeight: 'bold',
      marginVertical: 20,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    boxinfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 10
    },
    clock: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    textClock: {
      color: 'green',
      fontSize: 15,
      marginHorizontal: 5
    },
    textStart: {
      
    },
    boxTable: {
      paddingVertical: 10,
    },
    line: {
      width: '100%',
      borderTopWidth: 1.5,
      borderColor: Color.backGround2
    },
    tableTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 10,
    },
    tableHeader: {
      flexDirection: "row",
      paddingVertical: 8,
      backgroundColor: "#e0e0e0",
      borderRadius: 4,
      marginBottom: 5,
    },
    headerText: {
      flex: 1,
      fontSize: 16,
      fontWeight: "bold",
      textAlign: "center",
    },
    tableRow: {
      flexDirection: "row",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: "#ddd",
    },
    todayRow: {
      backgroundColor: "#e6f3ff", // Màu nền cho ngày hiện tại
    },
    dayText: {
      flex: 1,
      fontSize: 16,
      color: "#333",
    },
    timeText: {
      flex: 1,
      fontSize: 16,
      color: "#333",
      textAlign: "center",
    },
    todayText: {
      fontWeight: "bold",
      color: "#007AFF", // Màu chữ cho ngày hiện tại
    },
  });


export default CardDetails;