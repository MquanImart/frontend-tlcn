import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { FlatList } from "react-native-gesture-handler";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { useState } from "react";


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
        <TouchableOpacity style={isCurrentTab?styles.currenttab:styles.tab} onPress={onPressTab}>
            <Text style={isCurrentTab?styles.currenttext:styles.text}>{label}</Text>
        </TouchableOpacity>
    )
}

const TabbarTop = ({tabs, startTab, setTab} : TabbarTopProps) => {
    useTheme()
    return (
        <View style={styles.container}>
            {/* <FlatList style={styles.listTabs} data={tabs} renderItem={({item}) => 
              <Tab label={item.label} 
                onPressTab={() => {setTab(item.label)}} 
                isCurrentTab={startTab===item.label?true:false}
              />}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            /> */}
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
      height: 60
    },
    listTabs: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 10,
    },
    tab: {
      width: "30%",
      paddingVertical: 10,
      marginHorizontal: 5,
    },
    currenttab: {
      width: "30%",
      paddingVertical: 10,
      marginHorizontal: 5,
      borderBottomColor: Color.borderColorwb,
      borderBottomWidth: 1,
    },
    text: {
      color: Color.textColor1,
      fontSize: 16,
      fontWeight: '300',
      textAlign: 'center',
    },
    currenttext: {
        color: Color.textColor1,
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
      },
  });

export default TabbarTop;