import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors, Radius } from "../../constants/theme";

interface HolidayRibbonProps {
  message: string;
  urgency: "today" | "tomorrow" | "upcoming";
  onDismiss: () => void;
}

export default function HolidayRibbon({
  message,
  urgency,
  onDismiss,
}: HolidayRibbonProps) {
  const isToday = urgency === "today";
  const color = isToday ? Colors.red : Colors.orange;
  const bg = isToday ? Colors.redBg : Colors.orangeBg;

  return (
    <View style={[styles.ribbon, { backgroundColor: bg, borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{message}</Text>
      <TouchableOpacity onPress={onDismiss} style={styles.dismiss}>
        <Text style={[styles.dismissText, { color }]}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  ribbon: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: Radius.sm,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  text: { fontSize: 13, fontWeight: "600", flex: 1 },
  dismiss: { paddingLeft: 10 },
  dismissText: { fontSize: 14, fontWeight: "700" },
});
