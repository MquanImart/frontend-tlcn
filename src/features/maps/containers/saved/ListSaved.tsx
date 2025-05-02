import getColor from "@/src/styles/Color";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native"
import SavedLocations from "../../components/SavedLocations";
import { FlatList } from "react-native-gesture-handler";
import useListSaved from "./useListSaved";
import { useEffect } from "react";
import { LocationProps } from "../useMap";
import Icon from "react-native-vector-icons/MaterialIcons";

interface ListSaveLocationProps {
    clickItem: (location: LocationProps) => void;
    open: boolean;
    setOpen: (value: boolean) => void;
}
const ListSaveLocation = ({clickItem, open, setOpen} : ListSaveLocationProps) => {

    const { savedLocations, getSavedLocation, deleteLocation } = useListSaved();

    useEffect(() => {
        getSavedLocation();
    },[open]);

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.iconDown}
                onPress={() => {setOpen(false)}}
            >
                <Icon name="expand-more" size={30} color="black" />
            </TouchableOpacity>
            <Text style={styles.title}>Danh sách đã lưu</Text>
            <FlatList style={styles.list} data={savedLocations} renderItem={
                ({item}) => 
                <SavedLocations location={item} deletePress={deleteLocation} onPress={() => {clickItem({
                    longitude: item.longitude,
                    latitude: item.latitude
                })}}/>
            }/>
        </View>
    )
}

const Color = getColor();
const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 600,
        backgroundColor: Color.backGround
    },
    iconDown: {
        width: '100%', height: 30,
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        marginVertical: 20 
    },
    list: {
        maxHeight: 500
    }
});

export default ListSaveLocation;