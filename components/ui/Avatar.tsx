import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/theme";

interface AvatarProps {
  name: string;
  size?: number;
  color?: string;
}

export default function Avatar({
  name,
  size = 40,
  color = Colors.accent,
}: AvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const radius = size * 0.22;

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: color + "22",
          borderColor: color,
        },
      ]}
    >
      <Text style={[styles.text, { color, fontSize: size * 0.32 }]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  text: { fontWeight: "800" },
});
