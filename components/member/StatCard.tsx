import { StyleSheet, Text, View } from "react-native";
import { Colors, Radius } from "../../constants/theme";

interface StatCardProps {
  value: string;
  label: string;
  color?: string;
}

export default function StatCard({
  value,
  label,
  color = Colors.accent,
}: StatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    alignItems: "center",
  },
  value: { fontSize: 22, fontWeight: "900", marginBottom: 4 },
  label: {
    fontSize: 10,
    color: Colors.muted,
    textAlign: "center",
    lineHeight: 14,
  },
});
