import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/theme";

interface InfoRowProps {
  label: string;
  value: string | undefined | null;
  valueColor?: string;
  border?: boolean;
}

export default function InfoRow({
  label,
  value,
  valueColor,
  border = true,
}: InfoRowProps) {
  return (
    <View style={[styles.row, border && styles.rowBorder]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, valueColor ? { color: valueColor } : null]}>
        {value || "—"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  label: { fontSize: 13, color: Colors.text2 },
  value: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
    flex: 1,
    textAlign: "right",
  },
});
