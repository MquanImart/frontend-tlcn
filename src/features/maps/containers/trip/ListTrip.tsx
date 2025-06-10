import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { View, StyleSheet, FlatList, ActivityIndicator } from "react-native"
import CardTrip from "../../components/CardTrip";
import CIconButton from "@/src/shared/components/button/CIconButton";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useFocusEffect } from "@react-navigation/native";
import useListTrip from "./useListTrip";
import { useCallback, useState } from "react";
import ModalCreateTrip from "../../components/ModalCreateTrip";
import HeaderTrip from "./HeaderTrip";

const ListTrip = () => {
    useTheme();
    const [visible, setVisible] = useState<boolean>(false);
    const { trips, getListTrip, createTrip, deleteTrip } = useListTrip();

    useFocusEffect(
        useCallback(() => {
            const load = async () => {
                await getListTrip();
            }
            load();
        }, [])
    );

    if (!trips) return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator color={Color.mainColor2}/></View>
    return (
        <View style={[styles.container, { backgroundColor: Color.background }]}>
            <View style={styles.searchContainer}>
              <HeaderTrip startTab="Chuyến đi" trips={trips}/>
            </View>
            <View style={styles.list}>
                <View style={[styles.line, { borderColor: Color.border }]}/>
                <FlatList data={trips} renderItem={({item}) =>
                    <CardTrip trip={item} deleteTrip={deleteTrip}/>
                }/>
            </View>
            <View style={styles.add}>
                <CIconButton icon={<Icon name={"add"} size={20} color={Color.textOnMain2}/>}
                    label="Tạo chuyến đi"
                    onSubmit={() => {setVisible(true)}}
                    style={{
                    width: 200,
                    height: 50,
                    backColor: Color.mainColor2,
                    textColor: Color.textOnMain2,
                    radius: 50,
                    shadow: true
                }}/>
            </View>
            <ModalCreateTrip visible={visible} setVisible={setVisible} submitModal={createTrip}/>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchContainer: {
        marginBottom: 20
    },
    list: {
        height: 500,
    },
    add: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20
    },
    line: {
        borderTopWidth: 1,
        width: '90%',
        alignSelf: 'center',
    }
});

export default ListTrip;