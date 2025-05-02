import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import TicketList from "../../../components/TicketList";
import AddTicketModal from "../../../components/AddTicketModal";
import CIconButton from "@/src/shared/components/button/CIconButton";
import Icon from "react-native-vector-icons/MaterialIcons";
import getColor from "@/src/styles/Color";
import usePageTickets from "./usePageTickets";
import { Page } from "@/src/interface/interface_reference";

const Color = getColor();

interface PageTicketsProps {
  page: Page;
  currentUserId: string;
  role: string;
}

const PageTickets: React.FC<PageTicketsProps> = ({ page, role }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const {
    ticketList,
    loading,
    createTicket,
    canManageTickets,
    handleDeleteTicket
  } = usePageTickets(page, role);


  return (
    <View style={styles.container}>
      <TicketList tickets={ticketList} onDeleteTicket={handleDeleteTicket} loading={loading} />

      {canManageTickets && (
        <CIconButton
          label="Tạo vé"
          icon={<Icon name="add-circle-outline" size={24} color="white" />}
          onSubmit={() => setModalVisible(true)}
          style={{
            width: "90%",
            height: 50,
            backColor: Color.mainColor1,
            textColor: "white",
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
    backgroundColor: Color.backGround,
    padding: 20,
    alignItems: "center",
  },
});
