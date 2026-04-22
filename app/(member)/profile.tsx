import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { supabase }      from '../../lib/supabase';
import { Colors, Radius} from '../../constants/theme';
import Card              from '../../components/ui/Card';
import Button            from '../../components/ui/Button';
import InfoRow           from '../../components/ui/InfoRow';
import SectionHeader     from '../../components/ui/SectionHeader';
import Avatar            from '../../components/ui/Avatar';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [member,  setMember]  = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [{ data: prof }, { data: mem }] = await Promise.all([
        supabase.from('profiles').select('first_name, last_name, email, phone').eq('id', user.id).single(),
        supabase.from('members').select('member_number, date_of_birth, gender, address, emergency_name, emergency_phone, created_at').eq('profile_id', user.id).single(),
      ]);
      setProfile(prof);
      setMember(mem);
      setLoading(false);
    }
    load();
  }, []);

  function handleLogout() {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => supabase.auth.signOut() },
    ]);
  }

  const fullName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim();

  if (loading) return (
    <View style={s.loadingWrap}><Text style={s.loadingText}>Loading...</Text></View>
  );

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

      {/* Avatar */}
      <View style={s.avatarWrap}>
        <Avatar name={fullName || 'M'} size={80} color={Colors.accent} />
        <Text style={s.name}>{fullName}</Text>
        <Text style={s.memberId}>{member?.member_number}</Text>
        <Text style={s.memberSince}>
          Member since {member?.created_at
            ? new Date(member.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
            : '—'}
        </Text>
      </View>

      {/* Personal info */}
      <View style={s.section}>
        <SectionHeader title="Personal Information" />
        <Card>
          <InfoRow label="Email"   value={profile?.email} />
          <InfoRow label="Phone"   value={profile?.phone} />
          <InfoRow label="DOB"     value={member?.date_of_birth ? new Date(member.date_of_birth + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'} />
          <InfoRow label="Gender"  value={member?.gender} />
          <InfoRow label="Address" value={member?.address} border={false} />
        </Card>
      </View>

      {/* Emergency contact */}
      {(member?.emergency_name || member?.emergency_phone) && (
        <View style={s.section}>
          <SectionHeader title="Emergency Contact" />
          <Card>
            <InfoRow label="Name"  value={member?.emergency_name} />
            <InfoRow label="Phone" value={member?.emergency_phone} border={false} />
          </Card>
        </View>
      )}

      <Button label="Sign Out" onPress={handleLogout} variant="danger" style={s.logoutBtn} />
      <Text style={s.footer}>IronForge Member App · v1.0.0</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll:      { flex: 1, backgroundColor: Colors.bg },
  content:     { padding: 20, paddingTop: 20, paddingBottom: 40 },
  loadingWrap: { flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: Colors.text2 },
  avatarWrap:  { alignItems: 'center', marginBottom: 32 },
  name:        { fontSize: 22, fontWeight: '800', color: Colors.text, marginTop: 12 },
  memberId:    { fontSize: 13, color: Colors.text2, letterSpacing: 1, marginTop: 4 },
  memberSince: { fontSize: 12, color: Colors.muted, marginTop: 4 },
  section:     { marginBottom: 20 },
  logoutBtn:   { marginBottom: 24 },
  footer:      { textAlign: 'center', color: Colors.muted, fontSize: 12 },
});
