import { StyleSheet, View, ViewStyle } from "react-native";
import { Colors, Radius } from "../../constants/theme";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  accent?: boolean; // yellow top bar
  padding?: number;
}

export default function Card({
  children,
  style,
  accent,
  padding = 16,
}: CardProps) {
  return (
    <View style={[styles.card, style]}>
      {accent && <View style={styles.accentBar} />}
      <View style={{ padding }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  accentBar: { height: 3, backgroundColor: Colors.accent },
});
