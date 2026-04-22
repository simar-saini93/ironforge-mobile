import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/theme";
import Card from "../ui/Card";

interface MembershipCardProps {
  sub: any;
  status: string | null;
}

function fmtDate(d: string) {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysLeft(end: string) {
  if (!end) return 0;
  return Math.ceil(
    (new Date(end + "T00:00:00").getTime() - Date.now()) / 864e5,
  );
}

export default function MembershipCard({ sub, status }: MembershipCardProps) {
  if (!sub) {
    return (
      <Card accent style={styles.card}>
        <Text style={styles.noSub}>No active membership</Text>
      </Card>
    );
  }

  const days = daysLeft(sub.end_date);
  const daysColor =
    days > 7 ? Colors.accent : days > 0 ? Colors.orange : Colors.red;

  return (
    <Card accent style={styles.card}>
      <Text style={styles.cardLabel}>Current Membership</Text>
      <Text style={styles.planName}>
        {(sub.plan?.billing_cycle || "").replace(/_/g, " ").toUpperCase()}
      </Text>
      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.colLabel}>Start</Text>
          <Text style={styles.colValue}>{fmtDate(sub.start_date)}</Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.colLabel}>Expires</Text>
          <Text style={[styles.colValue, days <= 3 && { color: Colors.red }]}>
            {fmtDate(sub.end_date)}
          </Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.colLabel}>Remaining</Text>
          <Text style={[styles.colValue, { color: daysColor }]}>
            {days > 0 ? `${days}d` : "Expired"}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 16 },
  cardLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.text2,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  planName: {
    fontSize: 22,
    fontWeight: "900",
    color: Colors.accent,
    marginBottom: 14,
    letterSpacing: 1,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  col: {},
  colLabel: { fontSize: 10, color: Colors.muted, marginBottom: 2 },
  colValue: { fontSize: 13, fontWeight: "600", color: Colors.text },
  noSub: { fontSize: 14, color: Colors.text2 },
});
