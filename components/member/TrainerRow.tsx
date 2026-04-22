import { StyleSheet, Text, View } from "react-native";
import { Colors, Radius } from "../../constants/theme";
import Avatar from "../ui/Avatar";

interface TrainerRowProps {
  name: string;
  specialization?: string;
  shift?: string;
  color?: string;
}

export default function TrainerRow({
  name,
  specialization,
  shift,
  color = Colors.accent,
}: TrainerRowProps) {
  return (
    <View style={styles.row}>
      <Avatar name={name} size={36} color={color} />
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        {specialization && <Text style={styles.spec}>{specialization}</Text>}
      </View>
      {shift && <Text style={styles.shift}>{shift}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.card,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    marginBottom: 8,
  },
  info: { flex: 1 },
  name: { fontSize: 13, fontWeight: "600", color: Colors.text },
  spec: { fontSize: 11, color: Colors.text2, marginTop: 1 },
  shift: { fontSize: 11, color: Colors.text2 },
});
