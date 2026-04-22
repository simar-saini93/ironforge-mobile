import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';

function Header() {
  return (
    <View style={styles.header}>
      <Text style={styles.logo}>
        IRON<Text style={styles.logoAccent}>FORGE</Text>
      </Text>
    </View>
  );
}

function TabIcon({ name, focused }: { name: any; focused: boolean }) {
  return (
    <View style={styles.iconWrap}>
      <Ionicons name={name} size={24} color={focused ? Colors.accent : '#333'} />
      <View style={[styles.dot, { backgroundColor: focused ? Colors.accent : 'transparent' }]} />
    </View>
  );
}

export default function MemberLayout() {
  return (
    <>
      <Header />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarShowLabel: false,
        }}
      >
        <Tabs.Screen name="index"
          options={{ tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} /> }}
        />
        <Tabs.Screen name="payments"
          options={{ tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'card' : 'card-outline'} focused={focused} /> }}
        />
        <Tabs.Screen name="schedule"
          options={{ tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'calendar' : 'calendar-outline'} focused={focused} /> }}
        />
        <Tabs.Screen name="attendance"
          options={{ tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'pulse' : 'pulse-outline'} focused={focused} /> }}
        />
        <Tabs.Screen name="profile"
          options={{ tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} /> }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  header:     { backgroundColor: '#111', borderBottomWidth: 1, borderBottomColor: '#1f1f1f', paddingTop: 56, paddingBottom: 14, alignItems: 'center' },
  logo:       { fontSize: 20, fontWeight: '900', letterSpacing: 3, color: '#f0f0f0' },
  logoAccent: { color: Colors.accent },
  tabBar:     { backgroundColor: '#111', borderTopColor: '#1f1f1f', borderTopWidth: 1, height: 70, paddingBottom: 0, paddingTop: 0, justifyContent: 'center' },
  iconWrap:   { alignItems: 'center', justifyContent: 'center', gap: 5, flex: 1, height: '100%' },
  dot:        { width: 4, height: 4, borderRadius: 2 },
});
