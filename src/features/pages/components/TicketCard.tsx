import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import getColor from "@/src/styles/Color";
import { Ticket } from "@/src/interface/interface_reference";

const Color = getColor();

interface TicketCardProps {
  ticket: Ticket;
  onDeleteTicket: (ticketId: string) => void; 
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket, onDeleteTicket }) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.leftBorder} />

      <TouchableOpacity 
        style={styles.card} 
        onPress={() => onDeleteTicket(ticket._id)} 
      >
        <Text style={styles.title}>{ticket.name}</Text>
        <Text style={styles.price}>Giá: {ticket.price.toLocaleString()} đồng</Text>
        {ticket.description && <Text style={styles.description}>Mô tả: {ticket.description}</Text>}
      </TouchableOpacity>
    </View>
  );
};

export default TicketCard;

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  leftBorder: {
    width: 8,
    height: "100%",
    backgroundColor: Color.mainColor1,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  card: {
    flex: 1,
    backgroundColor: Color.white_homologous,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Color.borderColor1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginLeft: -2,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: Color.textColor1,
  },
  price: {
    fontSize: 14,
    color: Color.textColor1,
    marginTop: 4,
  },
  description: {
    fontSize: 13,
    color: Color.textColor1,
    marginTop: 2,
  },
});
