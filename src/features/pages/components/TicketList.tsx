import React from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import TicketCard from "./TicketCard";
import { Ticket } from "@/src/interface/interface_reference";

interface TicketListProps {
  tickets: Ticket[];
  onDeleteTicket: (ticketId: string) => void; // Handler for deleting the ticket
  loading: boolean;
  
}

const TicketList: React.FC<TicketListProps> = ({ tickets, onDeleteTicket, loading }) => {
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="blue" />
        <Text>Đang tải...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <FlatList
        data={tickets}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TicketCard ticket={item} onDeleteTicket={onDeleteTicket} />
        )}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </View>
  );
};

export default TicketList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
