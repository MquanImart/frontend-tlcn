import CButton from "@/src/shared/components/button/CButton"
import getColor from "@/src/styles/Color"
import { View, StyleSheet } from "react-native"

const Color = getColor();

export interface ButtonFriendsProps {
    actions: (() => void)[];
    label: string[];
}

export const ButtonActions = ({actions, label} : ButtonFriendsProps) => {

    const width = label.length > 1? "48%" : "96%";
    
    return (
        <View style={styles.container}>
            {actions.map((item, index) => <CButton key={index} label={label[index]} onSubmit={item} 
                style={{
                width: width,
                height: 35,
                backColor: Color.mainColor1,
                textColor: Color.textColor2,
                fontSize: 13
            }}/>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around'
    }
})