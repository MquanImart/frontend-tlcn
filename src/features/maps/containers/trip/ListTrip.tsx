import getColor from "@/src/styles/Color";
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

    if (!trips) return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator/></View>
    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
              <HeaderTrip startTab="Chuyến đi" trips={trips}/>
            </View>
            <View style={styles.list}>
                <View style={styles.line}/>
                <FlatList data={trips} renderItem={({item}) => 
                    <CardTrip trip={item} deleteTrip={deleteTrip}/>
                }/>
            </View>
            <View style={styles.add}>
                <CIconButton icon={<Icon name={"add"} size={20} color={Color.white_homologous}/>} 
                    label="Tạo chuyến đi"
                    onSubmit={() => {setVisible(true)}} 
                    style={{
                    width: 200,
                    height: 50,
                    backColor: Color.mainColor1,
                    textColor: Color.textColor2,
                    radius: 50,
                    shadow: true
                }}/>
            </View>
            <ModalCreateTrip visible={visible} setVisible={setVisible} submitModal={createTrip}/>
        </View>
    )
}

const Color = getColor();
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Color.backGround
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
        borderColor: Color.textColor3,
        width: '90%',
        alignSelf: 'center',
    }
});

export default ListTrip;