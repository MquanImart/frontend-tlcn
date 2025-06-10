import CButton from "@/src/shared/components/button/CButton" // Make sure CButton is updated
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { View, StyleSheet } from "react-native"


export interface ButtonFriendsProps {
    actions: (() => void)[];
    label: string[];
    _id?:string;
}

export const ButtonActions = ({actions, label, _id} : ButtonFriendsProps) => {
    useTheme(); 
    const width = label.length > 1 ? "48%" : "96%"; 

    return (
        <View style={styles.container}>
            {actions.map((item, index) => (
                <CButton
                    key={`button-${_id}-${index}`}
                    label={label[index]}
                    onSubmit={item}
                    style={{
                        width: width,
                        height: 35,
                        backColor: Color.mainColor2,
                        textColor: Color.textOnMain2,
                        fontSize: 13,
                        fontWeight: 'bold',
                        radius: 8, 
                    }}
                />
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center', 
    }
})