import { MyPhoto } from "@/src/interface/interface_flex";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { Image } from 'expo-image';
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";


interface PreviewImagesProps {
    label: string;
    onPressViewAll: () => void;
    handleSelected: (_id: string) => void;
    src: MyPhoto[];
}

const PreviewImages = ({label, onPressViewAll, handleSelected, src}: PreviewImagesProps) => {
    useTheme();
    return (
        <View style={styles.container}>
            <View style={styles.boxTitle}>
                <Text style={styles.label}>{label}</Text>
                <TouchableOpacity onPress={onPressViewAll}>
                    <Text style={styles.textViewAll}>Xem tất cả</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.boxImages}>
              {src.reduce((rows: MyPhoto[][], item, index) => {
                if (index % 2 === 0) rows.push([]);
                rows[rows.length - 1].push(item);
                return rows;
              }, []).map((row, rowIndex) => (
                <View style={styles.row} key={rowIndex}>
                  {row.map((item) => (
                    <TouchableOpacity key={item._id} style={styles.item} onPress={() => handleSelected(item._id)}>
                      <Image source={{uri: item.url}} style={styles.image} />
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        maxHeight: 420,
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
        color: Color.gray4
    },
    boxImages: {
        maxHeight: 400, width: '100%'
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
    text: {
      padding: 5,
      textAlign: 'center',
      fontSize: 14,
      fontWeight: 'bold',
    },
})

export default PreviewImages;