import { Page } from "@/src/interface/interface_reference";
import CIconButton from "@/src/shared/components/button/CIconButton";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import AddTicketModal from "../../../components/AddTicketModal";
import TicketList from "../../../components/TicketList";
import usePageTickets from "./usePageTickets";


interface PageTicketsProps {
  page: Page;
  currentUserId: string;
  role: string;
  updatePage: () => void;
}

const PageTickets: React.FC<PageTicketsProps> = ({ page, role , updatePage}) => {
  useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const {
    ticketList,
    loading,
    createTicket,
    canManageTickets,
    handleDeleteTicket
  } = usePageTickets(page, role, updatePage);


  return (
    <View style={[styles.container, { backgroundColor: Color.background }]}>
      <TicketList tickets={ticketList} onDeleteTicket={handleDeleteTicket} loading={loading} />

      {canManageTickets && (
        <CIconButton
          label="Tạo dịch vụ"
          icon={<Icon name="add-circle-outline" size={24} color={Color.textOnMain2} />}
          onSubmit={() => setModalVisible(true)}
          style={{
            width: "90%",
            height: 50,
            backColor: Color.mainColor2,
            textColor: Color.textOnMain2, 
            fontSize: 18,
            fontWeight: "bold",
            radius: 30,
            flex_direction: "row",
          }}
        />
      )}

      <AddTicketModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAddTicket={createTicket}
      />
    </View>
  );
};

export default PageTickets;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor applied inline
    padding: 20,
    alignItems: "center",
  },
});