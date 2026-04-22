import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/theme";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export default function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 10, marginTop: 4 },
  title: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.text2,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  subtitle: { fontSize: 12, color: Colors.muted, marginTop: 2 },
});
