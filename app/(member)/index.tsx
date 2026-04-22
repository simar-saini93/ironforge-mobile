import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { supabase }       from '../../lib/supabase';
import { Colors, Radius } from '../../constants/theme';
import Card               from '../../components/ui/Card';
import Badge              from '../../components/ui/Badge';
import SectionHeader      from '../../components/ui/SectionHeader';
import HolidayRibbon      from '../../components/member/HolidayRibbon';
import MembershipCard     from '../../components/member/MembershipCard';

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}
function fmtActivityDate(iso: string) {
  const d    = new Date(iso);
  const now  = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 864e5);
  if (diff === 0) return `Today · ${fmtTime(iso)}`;
  if (diff === 1) return `Yesterday · ${fmtTime(iso)}`;
  return `${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · ${fmtTime(iso)}`;
}
function fmtTime24(t: string) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hr = parseInt(h);
  return `${hr === 0 ? 12 : hr > 12 ? hr - 12 : hr}:${m}${hr >= 12 ? 'PM' : 'AM'}`;
}

function realStatus(sub: any) {
  if (!sub) return null;
  if (sub.status === 'frozen') return 'frozen';
  return sub.end_date < new Date().toISOString().split('T')[0] ? 'expired' : 'active';
}

const STATUS_VARIANT: Record<string, any> = {
  active: 'active', expired: 'expired', frozen: 'frozen',
};

export default function DashboardScreen() {
  const [profile,    setProfile]    = useState<any>(null);
  const [member,     setMember]     = useState<any>(null);
  const [sub,        setSub]        = useState<any>(null);
  const [activity,   setActivity]   = useState<any[]>([]);
  const [subs,       setSubs]       = useState<any[]>([]);
  const [schedule,   setSchedule]   = useState<any>(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ribbon,     setRibbon]     = useState<{ message: string; urgency: 'today' | 'tomorrow' | 'upcoming' } | null>(null);
  const [ribbonDismissed, setRibbonDismissed] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: prof }, { data: mem }] = await Promise.all([
        supabase.from('profiles').select('first_name, last_name').eq('id', user.id).single(),
        supabase.from('members').select(`
          id, member_number, created_at,
          subscription:member_subscriptions(id, status, start_date, end_date, plan:membership_plans(billing_cycle))
        `).eq('profile_id', user.id).single(),
      ]);

      setProfile(prof);
      setMember(mem);

      if (mem) {
        const activeSub = mem.subscription?.find((s: any) => s.status === 'active') || mem.subscription?.[0];
        setSub(activeSub);

        // Latest 3 subscriptions
        const { data: subRows } = await supabase
          .from('member_subscriptions')
          .select('id, status, start_date, end_date, plan:membership_plans(billing_cycle)')
          .eq('member_id', mem.id)
          .order('created_at', { ascending: false })
          .limit(3);
        setSubs(subRows || []);

        // Latest 3 access logs
        const { data: logs } = await supabase
          .from('daily_access_logs')
          .select('id, accessed_at, access_type')
          .eq('member_id', mem.id)
          .order('accessed_at', { ascending: false })
          .limit(3);
        setActivity(logs || []);
      }

      // Schedule
      try {
        const res  = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/api/schedule`);
        const json = await res.json();
        setSchedule(json);

        const todayStr = new Date().toISOString().split('T')[0];
        const in7      = new Date(Date.now() + 7 * 864e5).toISOString().split('T')[0];
        if (json.today?.is_closed) {
          setRibbon({ urgency: 'today', message: json.today.holiday ? `Gym closed today — ${json.today.holiday.title}` : 'Gym closed today' });
        } else if (json.tomorrow?.is_closed) {
          setRibbon({ urgency: 'tomorrow', message: json.tomorrow.reason ? `Gym closed tomorrow — ${json.tomorrow.reason}` : 'Gym closed tomorrow' });
        } else {
          const upHol = json.holidays?.find((h: any) => h.date > todayStr && h.date <= in7);
          if (upHol) setRibbon({ urgency: 'upcoming', message: `Gym closed ${new Date(upHol.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} — ${upHol.title}` });
        }
      } catch { }

    } catch (err: any) {
      console.error('Dashboard error:', err?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  function onRefresh() { setRefreshing(true); fetchAll(); }

  const subStatus = realStatus(sub);
  const gymToday  = schedule?.today;
  const holidays  = (schedule?.holidays || []).slice(0, 3);

  if (loading) return (
    <View style={s.loadingWrap}><Text style={s.loadingText}>Loading...</Text></View>
  );

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
    >
      {/* Ribbon */}
      {ribbon && !ribbonDismissed && (
        <HolidayRibbon message={ribbon.message} urgency={ribbon.urgency} onDismiss={() => setRibbonDismissed(true)} />
      )}

      {/* Greeting */}
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Hello, {profile?.first_name || 'Member'} 💪</Text>
          <Text style={s.memberId}>{member?.member_number}</Text>
        </View>
        {subStatus && <Badge label={subStatus} variant={STATUS_VARIANT[subStatus]} />}
      </View>

      {/* Membership card */}
      <MembershipCard sub={sub} status={subStatus} />

      {/* Recent Activity */}
      <View style={s.section}>
        <SectionHeader title="Recent Activity" />
        <Card>
          {activity.length === 0 ? (
            <View style={s.emptyRow}>
              <Text style={s.emptyText}>No check-ins yet</Text>
            </View>
          ) : (
            activity.map((log, i) => (
              <View key={log.id} style={[s.activityRow, i < activity.length - 1 && s.rowBorder]}>
                <View style={[s.activityDot, i === 0 && s.activityDotActive]} />
                <View style={{ flex: 1 }}>
                  <Text style={s.activityTitle}>Check-in</Text>
                  <Text style={s.activityTime}>{fmtActivityDate(log.accessed_at)}</Text>
                </View>
                <View style={s.entryBadge}>
                  <Text style={s.entryBadgeText}>{(log.access_type || 'ENTRY').toUpperCase()}</Text>
                </View>
              </View>
            ))
          )}
        </Card>
      </View>

      {/* Gym & Holidays */}
      <View style={s.section}>
        <SectionHeader title="Gym & Holidays" />
        <Card>
          {/* Today status */}
          <View style={[s.gymRow, s.rowBorder]}>
            <View style={[s.gymDot, { backgroundColor: gymToday?.is_closed ? Colors.red : Colors.green }]} />
            <Text style={s.gymLabel}>{gymToday?.is_closed ? 'Closed Today' : 'Open Today'}</Text>
            {!gymToday?.is_closed && (
              <Text style={s.gymHours}>
                {fmtTime24(gymToday?.timings?.open || schedule?.gym?.default_open || '06:00')} – {fmtTime24(gymToday?.timings?.close || schedule?.gym?.default_close || '22:00')}
              </Text>
            )}
          </View>

          {/* Upcoming holidays */}
          {holidays.length === 0 ? (
            <View style={s.emptyRow}>
              <Text style={s.emptyText}>No upcoming holidays</Text>
            </View>
          ) : (
            holidays.map((h: any, i: number) => (
              <View key={h.id} style={[s.holidayRow, i < holidays.length - 1 && s.rowBorder]}>
                <View style={[s.gymDot, { backgroundColor: Colors.red }]} />
                <View style={{ flex: 1 }}>
                  <Text style={s.activityTitle}>{h.title}</Text>
                  <Text style={s.activityTime}>
                    {new Date(h.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </Text>
                </View>
                <View style={s.holidayBadge}>
                  <Text style={s.holidayBadgeText}>HOLIDAY</Text>
                </View>
              </View>
            ))
          )}
        </Card>
      </View>
      {/* Subscriptions */}
      <View style={s.section}>
        <SectionHeader title="Subscriptions" />
        <Card>
          {subs.length === 0 ? (
            <View style={s.emptyRow}><Text style={s.emptyText}>No subscriptions found</Text></View>
          ) : (
            subs.map((sub: any, i: number) => {
              const today    = new Date().toISOString().split('T')[0];
              const isActive   = sub.status !== 'frozen' && sub.start_date <= today && sub.end_date >= today;
              const isFuture   = sub.start_date > today;
              const statusColor = isActive ? Colors.green : isFuture ? Colors.accent : sub.status === 'frozen' ? Colors.blue : Colors.red;
              const statusBg    = isActive ? Colors.greenBg : isFuture ? Colors.accentBg2 : sub.status === 'frozen' ? 'rgba(56,189,248,0.1)' : Colors.redBg;
              const statusLabel = isActive ? 'ACTIVE' : isFuture ? 'COMING SOON' : sub.status === 'frozen' ? 'FROZEN' : 'EXPIRED';
              return (
                <View key={sub.id} style={[s.subRow, i < subs.length - 1 && s.rowBorder]}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.subPlan}>{(sub.plan?.billing_cycle || '').replace(/_/g, ' ').toUpperCase()}</Text>
                    <Text style={s.activityTime}>
                      {new Date(sub.start_date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {' → '}
                      {new Date(sub.end_date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                  </View>
                  <View style={[s.subBadge, { backgroundColor: statusBg }]}>
                    <Text style={[s.subBadgeText, { color: statusColor }]}>{statusLabel}</Text>
                  </View>
                </View>
              );
            })
          )}
        </Card>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll:            { flex: 1, backgroundColor: Colors.bg },
  content:           { padding: 20, paddingTop: 20, paddingBottom: 40 },
  loadingWrap:       { flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' },
  loadingText:       { color: Colors.text2, fontSize: 14 },

  header:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting:          { fontSize: 24, fontWeight: '800', color: Colors.text },
  memberId:          { fontSize: 12, color: Colors.text2, marginTop: 2, letterSpacing: 1 },

  section:           { marginBottom: 16 },

  rowBorder:         { borderBottomWidth: 1, borderBottomColor: Colors.border },

  activityRow:       { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  activityDot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border2, flexShrink: 0 },
  activityDotActive: { backgroundColor: Colors.accent },
  activityTitle:     { fontSize: 13, fontWeight: '600', color: Colors.text },
  activityTime:      { fontSize: 11, color: Colors.text2, marginTop: 2 },
  entryBadge:        { backgroundColor: Colors.greenBg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  entryBadgeText:    { fontSize: 9, fontWeight: '800', color: Colors.green, letterSpacing: .8 },

  gymRow:            { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  gymDot:            { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  gymLabel:          { flex: 1, fontSize: 13, fontWeight: '600', color: Colors.text },
  gymHours:          { fontSize: 12, fontWeight: '700', color: Colors.accent },

  holidayRow:        { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  holidayBadge:      { backgroundColor: Colors.redBg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  holidayBadgeText:  { fontSize: 9, fontWeight: '800', color: Colors.red, letterSpacing: .8 },

  subRow:            { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  subPlan:           { fontSize: 13, fontWeight: '700', color: Colors.text },
  subBadge:          { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  subBadgeText:      { fontSize: 9, fontWeight: '800', letterSpacing: .8 },
  emptyRow:          { padding: 16 },
  emptyText:         { fontSize: 13, color: Colors.muted, textAlign: 'center' },
});
