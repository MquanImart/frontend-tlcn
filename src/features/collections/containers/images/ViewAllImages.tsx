import { MyPhoto } from "@/src/interface/interface_flex";
import getColor from "@/src/styles/Color"
import { FlatList, View, Image, Text, StyleSheet, TouchableOpacity } from "react-native"

interface ViewAllImagesProps {
    label: string;
    onBack: () => void;
    handleScroll: (event: { nativeEvent: { contentOffset: { y: any; }; }; }) => void;
    src: MyPhoto[];
    handleSelected: (_id: string) => void;
}

const Color = getColor();

const ViewAllImages = ({label, src, onBack, handleScroll, handleSelected}: ViewAllImagesProps) => {
    return (
        <View style={styles.container}>
            <View style={styles.boxTitle}>
                <Text style={styles.label}>{label}</Text>
                <TouchableOpacity onPress={onBack}>
                    <Text style={styles.textViewAll}>Quay lại</Text>
                </TouchableOpacity>
            </View>
            <FlatList
              data={src}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.item} onPress={() => {handleSelected(item._id)}}>
                  <Image source={{uri: item.url}} style={styles.image}/>
                </TouchableOpacity>
              )}
              onScroll={handleScroll}
              keyExtractor={(item) => item._id}
              numColumns={2}
              columnWrapperStyle={styles.row}
            />
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '90%',
    },
    boxTitle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
    },
    label: {
        fontWeight: 'bold'
    },
    textViewAll: {
        color: Color.textColor3
    },
    boxImages: {
        height: 400, width: '100%'
    },
    row: {
        width: '100%',
        justifyContent: 'space-between',
        flexDirection: 'row',
    },
    item: {
      width: '49%', height: 180,
      margin: '0.5%',
      backgroundColor: '#fff',
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
    },
    image: {
      width:200,
      height: 200,
      resizeMode: 'cover',
    },
})


export default ViewAllImages;