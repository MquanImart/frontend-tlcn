import { Page } from "@/src/interface/interface_reference";
import CIconButton from "@/src/shared/components/button/CIconButton";
import getColor from "@/src/styles/Color";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import AddTicketModal from "../../../components/AddTicketModal";
import TicketList from "../../../components/TicketList";
import usePageTickets from "./usePageTickets";

const Color = getColor();

interface PageTicketsProps {
  page: Page;
  currentUserId: string;
  role: string;
  updatePage: () => void;
}

const PageTickets: React.FC<PageTicketsProps> = ({ page, role , updatePage}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const {
    ticketList,
    loading,
    createTicket,
    canManageTickets,
    handleDeleteTicket
  } = usePageTickets(page, role, updatePage);


  return (
    <View style={styles.container}>
      <TicketList tickets={ticketList} onDeleteTicket={handleDeleteTicket} loading={loading} />

      {canManageTickets && (
        <CIconButton
          label="Tạo dịch vụ"
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
