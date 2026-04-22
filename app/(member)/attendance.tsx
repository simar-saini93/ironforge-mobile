import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { supabase }      from '../../lib/supabase';
import { Colors, Radius} from '../../constants/theme';
import SectionHeader     from '../../components/ui/SectionHeader';
import StatCard          from '../../components/member/StatCard';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

// ── Log row ───────────────────────────────────────────────────
function LogRow({ log, isLast }: { log: any; isLast: boolean }) {
  const d = new Date(log.accessed_at);
  return (
    <View style={[s.logRow, !isLast && s.logRowBorder]}>
      <View style={s.logDate}>
        <Text style={s.logDay}>{d.getDate()}</Text>
        <Text style={s.logDow}>{d.toLocaleDateString('en-US', { weekday: 'short' })}</Text>
      </View>
      <View style={s.logDot} />
      <View>
        <Text style={s.logTime}>{fmtTime(log.accessed_at)}</Text>
        <Text style={s.logType}>{(log.access_type || 'entry').toUpperCase()}</Text>
      </View>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────
export default function AttendanceScreen() {
  const [grouped,    setGrouped]    = useState<Record<string, any[]>>({});
  const [totalCount, setTotalCount] = useState(0);
  const [thisMonth,  setThisMonth]  = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAttendance = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: member }   = await supabase.from('members').select('id').eq('profile_id', user!.id).single();
      if (!member) return;

      const { data } = await supabase
        .from('daily_access_logs')
        .select('id, accessed_at, access_type')
        .eq('member_id', member.id)
        .order('accessed_at', { ascending: false });

      const logs = data || [];
      setTotalCount(logs.length);

      const now = new Date();
      setThisMonth(logs.filter((l) => {
        const d = new Date(l.accessed_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length);

      const g: Record<string, any[]> = {};
      logs.forEach((log) => {
        const d   = new Date(log.accessed_at);
        const key = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
        if (!g[key]) g[key] = [];
        g[key].push(log);
      });
      setGrouped(g);
    } catch (err: any) {
      console.error('Attendance error:', err?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAttendance(); }, [fetchAttendance]);
  function onRefresh() { setRefreshing(true); fetchAttendance(); }

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
    >
      <Text style={s.pageTitle}>Attendance</Text>

      {/* Stats */}
      <View style={s.statsRow}>
        <StatCard value={String(thisMonth)}  label="This Month" color={Colors.accent} />
        <StatCard value={String(totalCount)} label="All Time"   color={Colors.green}  />
      </View>

      {loading ? (
        <Text style={s.emptyText}>Loading...</Text>
      ) : Object.keys(grouped).length === 0 ? (
        <Text style={s.emptyText}>No attendance records yet.</Text>
      ) : (
        Object.entries(grouped).map(([month, logs]) => (
          <View key={month} style={s.monthSection}>
            <View style={s.monthHeader}>
              <SectionHeader title={month} />
              <Text style={s.monthCount}>{logs.length} visits</Text>
            </View>
            <View style={s.logList}>
              {logs.map((log, i) => (
                <LogRow key={log.id} log={log} isLast={i === logs.length - 1} />
              ))}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll:       { flex: 1, backgroundColor: Colors.bg },
  content:      { padding: 20, paddingTop: 20, paddingBottom: 40 },
  pageTitle:    { fontSize: 28, fontWeight: '900', color: Colors.text, letterSpacing: 1, marginBottom: 20 },
  statsRow:     { flexDirection: 'row', gap: 12, marginBottom: 24 },
  emptyText:    { color: Colors.muted, textAlign: 'center', marginTop: 40, fontSize: 14 },
  monthSection: { marginBottom: 20 },
  monthHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  monthCount:   { fontSize: 12, color: Colors.text2 },
  logList:      { backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  logRow:       { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 14 },
  logRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  logDate:      { width: 36, alignItems: 'center' },
  logDay:       { fontSize: 20, fontWeight: '900', color: Colors.text, lineHeight: 22 },
  logDow:       { fontSize: 10, color: Colors.muted, fontWeight: '600' },
  logDot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.accent },
  logTime:      { fontSize: 14, fontWeight: '600', color: Colors.text },
  logType:      { fontSize: 10, color: Colors.text2, letterSpacing: 1, marginTop: 2 },
});
