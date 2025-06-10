import CIconButton from "@/src/shared/components/button/CIconButton";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons";
import CardLocationTrip from "./CardLocationTrip";
import { CLocation, Trip } from "@/src/interface/interface_detail";
import SearchPlace from "../containers/directions/SearchPlace";
import { LocationRoute } from "../containers/directions/interfaceAPIRoute";
import useTrip from "../containers/trip/useTrip";
import { MapStackParamList } from "@/src/shared/routes/MapNavigation";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";

interface DetailsTripProps {
    closeDetails: () => void;
    currState: boolean;
    trip: Trip;
    setTrip: (value: Trip | null) => void;
    suggestedForm: (value: boolean) => void;
}

type MapNavigationProp = StackNavigationProp<MapStackParamList, "CustomMap">;

const DetailsTrip = ({closeDetails, currState, trip, setTrip, suggestedForm}: DetailsTripProps) => {
    useTheme();
    const navigation = useNavigation<MapNavigationProp>();
    const [visibleSearch, setVisibleSearch] = useState<boolean>(false);
    const [currAddress, setCurrAddress] = useState<string | null>(null);

    const { updateTrip, addNewLocation, deleteLocation, changePosition } = useTrip(trip._id);

    const openSearch = (locationId?: string) => {
        if (locationId){
            setCurrAddress(locationId);
        } else {
            setCurrAddress(null);
        }
        setVisibleSearch(true);
    }

    const selectedSearch = async (value: LocationRoute) => {

        if (!currAddress){
            const result = await addNewLocation(trip._id, value);
            if (result !== null){
                setTrip(result);
            }
            setCurrAddress(null);
            setVisibleSearch(false);
            return;
        }

        const newValue : CLocation = {
            _id: currAddress,
            displayName: value.displayName?value.displayName: "Không xác định",
            latitude: value.latitude,
            longitude: value.longitude,
            address: value.address?value.address: "Không xác định"
        }

        const updatedTrip: Trip = {
          ...trip,
          startAddress:
            trip.startAddress._id === currAddress ? newValue : trip.startAddress,

          endAddress:
            trip.endAddress._id === currAddress ? newValue : trip.endAddress,

          listAddress: trip.listAddress.map((addr) =>
            addr._id === currAddress ? newValue : addr
          ),
        };

        await updateTrip(trip._id, updatedTrip);

        setTrip(updatedTrip);

        setCurrAddress(null);
        setVisibleSearch(false);
    };

    const handleDeleteLocation = async (id: string, locationId: string) => {
        const result = await deleteLocation(id, locationId);
        if (result){
            setTrip({
                ...trip,
                listAddress: trip.listAddress.filter((item) => item._id !== locationId)
            })
        }
    }

    const beginDirections = () => {
        navigation.navigate("Realtime", {locations: [...trip.listAddress, trip.endAddress]})
    }

    const changePositionAdress = async (up: boolean, index: number) => {
        if (index === 0 && up) return;
        if (index === trip.listAddress.length - 1 && !up) return;

        let result = false;
        if (up){
            result = await changePosition(trip._id, trip.listAddress[index]._id, trip.listAddress[index - 1]._id);
        } else {
            result = await changePosition(trip._id, trip.listAddress[index]._id, trip.listAddress[index + 1]._id);
        }
        if (result && trip) {
            const newList = [...trip.listAddress];

            if (up){
                const temp = newList[index];
                newList[index] = newList[index - 1];
                newList[index - 1] = temp;
            } else {
                const temp = newList[index];
                newList[index] = newList[index + 1];
                newList[index + 1] = temp;
            }

            setTrip({
              ...trip,
              listAddress: newList
            });
          }
    }

    return (
        <View style={styles.container}>
            <View style={styles.boxTitle}>
                <Text style={[styles.name, { color: Color.textPrimary }]}>{trip.name}</Text>
                <CIconButton icon={<Icon name={currState?"keyboard-arrow-down":"keyboard-arrow-up"} size={20} color={Color.textPrimary}/>}
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
            <View style={styles.actions}>
            <CIconButton icon={<Icon name={'place'} size={20} color={Color.textOnMain2}/>}
                    onSubmit={beginDirections}
                    label="Bắt đầu"
                    style={{
                        width: 100,
                        height: 40,
                        fontSize: 13,
                        backColor: Color.mainColor2,
                        textColor: Color.textOnMain2,
                        radius: 50,
                        flex_direction: 'row'
                    }}
                />
                <CIconButton icon={<Icon name={'lightbulb-outline'} size={20} color={Color.textOnMain2}/>}
                    onSubmit={() => {suggestedForm(true)}}
                    label="Gợi ý lộ trình"
                    style={{
                        width: 150,
                        height: 40,
                        fontSize: 13,
                        backColor: Color.mainColor2,
                        textColor: Color.textOnMain2,
                        radius: 50,
                        flex_direction: 'row'
                    }}
                />
            </View>
            <View style={[styles.cardCotent, { borderColor: Color.border }]}>
                <Text style={[styles.textContent, { color: Color.textPrimary }]}>Lộ trình</Text>
                <TouchableOpacity style={styles.add}
                    onPress={() => {openSearch()}}
                >
                    <Icon name={'add'} size={15} color={Color.mainColor2}/>
                    <Text style={[styles.textAdd, { color: Color.mainColor2 }]}>Thêm điểm đến</Text>
                </TouchableOpacity>
            </View>
            <ScrollView style={styles.list}>
                <CardLocationTrip key={`location-0`} location={trip.startAddress} onClick={openSearch}/>
                {trip.listAddress.map((item, index) =>
                    <CardLocationTrip key={`location-${index + 1}`}
                        location={item} isChange={true}
                        onClick={openSearch}
                        deletePress={() => {item._id && handleDeleteLocation(trip._id, item._id)}}
                        changePosition={(up) => {changePositionAdress(up, index)}}
                    />
                )}
                <CardLocationTrip key={`location-${trip.listAddress.length + 1}`} location={trip.endAddress} onClick={openSearch}/>
            </ScrollView>
            {visibleSearch && <View style={[styles.boxSearch, { backgroundColor: Color.background }]}>
                <SearchPlace
                onBack={() => {setVisibleSearch(false)}}
                selectedLocation={selectedSearch}/>
            </View>}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    name: {
      fontSize: 20,
      fontWeight: 'bold',
      marginVertical: 20,
    },
    boxTitle: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10
    },
    actions: {
        width: '75%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10
    },
    cardCotent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 20,
        marginHorizontal: 10,
        borderBottomWidth: 1,
        paddingHorizontal: 10,
    },
    add: {
        width: 120,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    textContent: {},
    textAdd: {},
    list: {
        width: '100%',
        height: 350,
        padding: 10
    },
    boxSearch: {
        position: 'absolute',
        top: -150,
        zIndex: 10,
        width: '100%',
        height: '100%',
        paddingTop: 10
    },
  });


export default DetailsTrip;