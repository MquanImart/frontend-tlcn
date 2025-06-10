import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { Ticket } from "@/src/interface/interface_reference";

interface TicketCardProps {
  ticket: Ticket;
  onDeleteTicket: (ticketId: string) => void;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket, onDeleteTicket }) => {
  useTheme();
  return (
    <View style={styles.cardContainer}>
      <View style={styles.leftBorder} />

      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: Color.backgroundSecondary, 
            borderColor: Color.border, 
            shadowColor: Color.shadow,
          },
        ]}
        onPress={() => onDeleteTicket(ticket._id)}
      >
        <Text style={[styles.title, { color: Color.textPrimary }]}>{ticket.name}</Text>
        <Text style={[styles.price, { color: Color.textPrimary }]}>Giá: {ticket.price.toLocaleString()} đồng</Text>
        {ticket.description && <Text style={[styles.description, { color: Color.textPrimary }]}>Mô tả: {ticket.description}</Text>}
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
    backgroundColor: Color.mainColor2,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  card: {
    flex: 1,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    padding: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginLeft: -2,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  price: {
    fontSize: 14,
    marginTop: 4,
  },
  description: {
    fontSize: 13,
    marginTop: 2,
  },
});