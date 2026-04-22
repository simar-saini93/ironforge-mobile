import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    ViewStyle,
} from "react-native";
import { Colors, Radius } from "../../constants/theme";

type Variant = "primary" | "ghost" | "danger";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

const VARIANTS = {
  primary: { bg: Colors.accent, text: "#000", border: Colors.accent },
  ghost: { bg: "transparent", text: Colors.text2, border: Colors.border2 },
  danger: { bg: Colors.redBg, text: Colors.red, border: Colors.red },
};

export default function Button({
  label,
  onPress,
  variant = "primary",
  loading,
  disabled,
  style,
}: ButtonProps) {
  const v = VARIANTS[variant];
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.btn,
        { backgroundColor: v.bg, borderColor: v.border },
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text} size="small" />
      ) : (
        <Text style={[styles.text, { color: v.text }]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 48,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  text: { fontSize: 14, fontWeight: "700", letterSpacing: 0.3 },
  disabled: { opacity: 0.5 },
});
