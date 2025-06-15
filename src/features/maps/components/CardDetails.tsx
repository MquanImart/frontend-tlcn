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

  if (saved === null || !location) return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator color={Color.mainColor2}/></View>
  const openingInfo = details && details.regularOpeningHours ? getOpeningStatus(details.regularOpeningHours) : null;
  const status = openingInfo ? openingInfo.status : "Không có thông tin";
  const nextEvent = openingInfo ? openingInfo.nextEvent : "Không có thông tin";

  return (
      <View style={[styles.container, { backgroundColor: Color.background }]}>
          <View style={styles.actions}>
            <Text style={[styles.name, { color: Color.textPrimary }]}>
              {details? details.displayName.text : `${location.latitude} , ${location.longitude}`}
            </Text>
            <CIconButton icon={<Icon name={'clear'} size={20} color={Color.textPrimary}/>}
                  onSubmit={closeDetails}
                  style={{
                      width: 50,
                      height: 50,
                      fontSize: 13,
                      radius: 50,
                      flex_direction: 'row',
                      backColor: 'transparent',
                      textColor: 'transparent'
                  }}
              />
          </View>
          <ScrollView showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
            <View style={styles.actions}>
            {tabsMap.map((item, index) =>
                <CIconButton key={index} icon={<Icon name={item.icon} size={15} color={index === 0 ? Color.textOnMain2 : Color.textPrimary}/>}
                    label={" " + (index === 1 && saved? "Đã lưu": item.label)}
                    onSubmit={() => {handlePressTab(item.label)}}
                    style={{
                        width: 110,
                        height: 35,
                        backColor: index === 0 ? Color.mainColor2 : Color.backgroundSecondary, // Changed to backgroundSecondary
                        textColor: index === 0 ? Color.textOnMain2 : Color.textPrimary,
                        fontSize: 13,
                        radius: 50,
                        flex_direction: 'row',
                        shadow: true
                    }}
                />
            )}
            </View>
            {details && <DetailsImages details={details}/>}
            <View style={[styles.line, { borderColor: Color.border }]}/>
            {status && nextEvent &&
            <View style={styles.boxinfo}>
              <View style={styles.clock}>
                <Icon name={'alarm'} size={25} color={Color.textPrimary}/>
                <Text style={[styles.textClock, { color: Color.success }]}>{status}</Text>
              </View>
              <Text style={[styles.textClock, { color: Color.textPrimary }]}>{nextEvent}</Text>
            </View>}
            <View style={[styles.line, { borderColor: Color.border }]}/>
            <View style={styles.boxTable}>
            <Text style={[styles.tableTitle, { color: Color.textPrimary }]}>Thời khóa biểu trong tuần</Text>
            <View style={[styles.tableHeader, { backgroundColor: Color.backgroundTertiary }]}>
              <Text style={[styles.headerText, { color: Color.textPrimary }]}>Ngày</Text>
              <Text style={[styles.headerText, { color: Color.textPrimary }]}>Giờ hoạt động</Text>
            </View>
            <View style={styles.boxinfo}>
              <Icon name={'place'} size={25} color={Color.textPrimary}/>
              <Text style={[styles.textStart, { color: Color.textPrimary }]}>{`${location.latitude} , ${location.longitude}`}</Text>
            </View>
            {details && details.regularOpeningHours && details.regularOpeningHours.weekdayDescriptions.map((item, index) => {
              const today = isToday(index, currentDate);
              return (
                <View key={`schedule-${index}`} style={[
                    styles.tableRow,
                    { borderBottomColor: Color.border },
                    today && styles.todayRow,
                    today && { backgroundColor: Color.backgroundSelected }
                ]}>
                  <Text style={[styles.dayText, { color: Color.textPrimary }, today && styles.todayText]}>
                    {item.split(":")[0]}
                  </Text>
                  <Text style={[styles.timeText, { color: Color.textPrimary }, today && styles.todayText]}>
                    {item.split(": ")[1]?.trim() || "Closed"}
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
      maxWidth: '85%',
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
      fontSize: 15,
      marginHorizontal: 5,
    },
    textStart: {
      // color is handled inline
    },
    boxTable: {
      paddingVertical: 10,
    },
    line: {
      width: '100%',
      borderTopWidth: 1.5,
    },
    tableTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 10,
    },
    tableHeader: {
      flexDirection: "row",
      paddingVertical: 8,
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
    },
    todayRow: {}, // Background color handled inline
    dayText: {
      flex: 1,
      fontSize: 16,
    },
    timeText: {
      flex: 1,
      fontSize: 16,
      textAlign: "center",
    },
    todayText: {
      fontWeight: "bold",
      color: Color.mainColor2,
    },
  });


export default CardDetails;