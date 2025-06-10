import CIconButton from "@/src/shared/components/button/CIconButton";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { View, Text, StyleSheet } from "react-native"
import CollectionsCard from "../../components/CollectionsCard";
import Icon from "react-native-vector-icons/MaterialIcons";
import { ViewCardCollection } from "./interface";
import InputCollectionModal from "../../components/InputCollectionModal";
import { useState } from "react";

interface ListCollectionsProps {
    collections: ViewCardCollection[];
    createCollection: (name: string) => void;
}
const ListCollections = ({ collections, createCollection }: ListCollectionsProps ) => {
    useTheme();
    const [modalVisible, setModalVisible] = useState(false);
    const handleInput = (value: string) => {
        createCollection(value);
    };

    return (
        <View style={styles.container}>
            <View style={styles.boxTitle}>
                <Text style={styles.textTilte}>Bộ sưu tập</Text>
                <CIconButton 
                    icon={<Icon name="add" size={20} color={Color.backGround1}/>} 
                    label="Tạo mới"
                    onSubmit={() => setModalVisible(true)} 
                    style={{
                    width: 100,
                    height: 37,
                    backColor: Color.mainColor2,
                    textColor: Color.textColor2,
                    flex_direction: "row"
                }}/>
            </View>
            <View style={styles.boxContent}>
                {collections.map((item, index) => 
                    <View key={index} style={styles.item}>
                        <CollectionsCard 
                            _id={item.collection._id} 
                            name={item.collection.name} 
                            img={item.imgDefault} 
                        />
                    </View>
                )}
            </View>
            <InputCollectionModal 
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onInput={handleInput}
                initialName={""} label={"Nhập tên bộ sưu tập"}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
    },
    boxTitle: {
        width: '90%',
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10
    },
    textTilte: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    boxContent: {
        width: '100%',
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        padding: 10,
    },
    item: {
        width: '49%',
        alignSelf: 'center',
        borderRadius: 10,
        marginVertical: 5,
        backgroundColor: Color.backGround,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    }
})

export default ListCollections;