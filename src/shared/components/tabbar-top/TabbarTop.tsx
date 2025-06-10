import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';


export interface TabProps{
    label: string;
    onPressTab?: () => void;
    isCurrentTab?: boolean;
}

interface TabbarTopProps{
    tabs: TabProps[];
    startTab: string;
    setTab: (tab: string) => void;
}


const Tab = ({label, onPressTab, isCurrentTab} : TabProps) => {
    useTheme()
    return (
        <TouchableOpacity
          style={[
            styles.tab,
            // Đảm bảo tab có cùng màu nền với container chính
            { backgroundColor: Color.backgroundSecondary }, // Sử dụng Color.backgroundSecondary làm nền mặc định cho tab
            isCurrentTab ? styles.currenttab : null
          ]}
          onPress={onPressTab}
        >
            <Text
              style={[
                styles.text,
                isCurrentTab ? styles.currenttext : null,
                { color: isCurrentTab ? Color.mainColor2 : Color.textPrimary } // Đặt màu chữ cho tab không chọn là Color.textPrimary
              ]}
            >
              {label}
            </Text>
        </TouchableOpacity>
    )
}

const TabbarTop = ({tabs, startTab, setTab} : TabbarTopProps) => {
    useTheme()
    return (
        // Đảm bảo container của tabbar cũng dùng chung màu nền
        <View style={[styles.container, { backgroundColor: Color.backgroundSecondary }]}>
            <View  style={styles.listTabs}>
            {tabs.map((item, index) =>
              <Tab key={index} label={item.label}
                onPressTab={() => {setTab(item.label)}}
                isCurrentTab={startTab===item.label?true:false}
              />
            )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
      width: '100%',
      height: 60,
    },
    listTabs: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginVertical: 10,
      paddingHorizontal: 10,
    },
    tab: {
      paddingVertical: 10,
      paddingHorizontal: 8,
      marginHorizontal: 5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    currenttab: {
      borderBottomColor: Color.mainColor2,
      borderBottomWidth: 2,
    },
    text: {
      fontSize: 16,
      fontWeight: '400',
      textAlign: 'center',
    },
    currenttext: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
      },
  });

export default TabbarTop;