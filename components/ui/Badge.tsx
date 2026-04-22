import { StyleSheet, Text, View } from "react-native";
import { Colors, Radius } from "../../constants/theme";

type Variant =
  | "active"
  | "expired"
  | "frozen"
  | "pending"
  | "yellow"
  | "green"
  | "red"
  | "blue"
  | "default";

const VARIANTS: Record<Variant, { bg: string; color: string; border: string }> =
  {
    active: {
      bg: Colors.greenBg,
      color: Colors.green,
      border: Colors.green + "44",
    },
    expired: { bg: Colors.redBg, color: Colors.red, border: Colors.red + "44" },
    frozen: {
      bg: "rgba(56,189,248,0.1)",
      color: Colors.blue,
      border: Colors.blue + "44",
    },
    pending: {
      bg: Colors.orangeBg,
      color: Colors.orange,
      border: Colors.orange + "44",
    },
    yellow: {
      bg: Colors.accentBg2,
      color: Colors.accent,
      border: Colors.accent + "44",
    },
    green: {
      bg: Colors.greenBg,
      color: Colors.green,
      border: Colors.green + "44",
    },
    red: { bg: Colors.redBg, color: Colors.red, border: Colors.red + "44" },
    blue: {
      bg: "rgba(56,189,248,0.1)",
      color: Colors.blue,
      border: Colors.blue + "44",
    },
    default: {
      bg: "rgba(160,160,160,0.1)",
      color: Colors.text2,
      border: Colors.border2,
    },
  };

interface BadgeProps {
  label: string;
  variant?: Variant;
  size?: "sm" | "md";
}

export default function Badge({
  label,
  variant = "default",
  size = "md",
}: BadgeProps) {
  const v = VARIANTS[variant] || VARIANTS.default;
  const sm = size === "sm";

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: v.bg, borderColor: v.border },
        sm && styles.badgeSm,
      ]}
    >
      <Text style={[styles.text, { color: v.color }, sm && styles.textSm]}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  badgeSm: { paddingHorizontal: 7, paddingVertical: 2 },
  text: { fontSize: 10, fontWeight: "700", letterSpacing: 0.8 },
  textSm: { fontSize: 9 },
});
