import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Colors, Radius } from '../../constants/theme';
import Card           from '../../components/ui/Card';
import SectionHeader  from '../../components/ui/SectionHeader';
import TrainerRow     from '../../components/member/TrainerRow';

const DAYS_S = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function fmtTime(t: string) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hr = parseInt(h);
  return `${hr === 0 ? 12 : hr > 12 ? hr - 12 : hr}:${m}${hr >= 12 ? 'PM' : 'AM'}`;
}

// ── Day chip ──────────────────────────────────────────────────
function DayChip({ date, day, isClosed, trainers, isToday }: any) {
  return (
    <View style={[
      s.dayCard,
      isToday  && s.dayCardActive,
      isClosed && s.dayCardClosed,
    ]}>
      <Text style={[s.dayName, isToday && s.dayNameActive]}>{DAYS_S[day.getDay()]}</Text>
      <Text style={[s.dayNum, isToday && { color: Colors.accent }, isClosed && { color: Colors.red }]}>
        {day.getDate()}
      </Text>
      {isClosed
        ? <Text style={s.dayClosed}>✕</Text>
        : trainers.length > 0
          ? <Text style={s.dayTrainers}>{trainers.length}👤</Text>
          : <View style={s.dayEmpty} />
      }
    </View>
  );
}

// ── Holiday row ───────────────────────────────────────────────
function HolidayRow({ holiday }: { holiday: any }) {
  const d = new Date(holiday.date + 'T00:00:00');
  return (
    <View style={s.holidayRow}>
      <View style={{ flex: 1 }}>
        <Text style={s.holidayTitle}>{holiday.title}</Text>
        {holiday.reason && <Text style={s.holidayReason}>{holiday.reason}</Text>}
      </View>
      <View style={s.holidayDate}>
        <Text style={s.holidayDateNum}>{d.getDate()}</Text>
        <Text style={s.holidayDateMonth}>{MONTHS[d.getMonth()]}</Text>
      </View>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────
export default function ScheduleScreen() {
  const [data,       setData]       = useState<any>(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSchedule = useCallback(async () => {
    try {
      const res  = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/api/schedule`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Schedule error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchSchedule(); }, [fetchSchedule]);
  function onRefresh() { setRefreshing(true); fetchSchedule(); }

  const today      = data?.today;
  const gym        = data?.gym;
  const holidays   = data?.holidays || [];
  const weeklyOffs = gym?.weekly_off_days || [];
  const todayStr   = new Date().toISOString().split('T')[0];

  const next7 = Array.from({ length: 7 }, (_, i) => {
    const d       = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return {
      date:      dateStr,
      day:       d,
      isToday:   dateStr === todayStr,
      isClosed:  weeklyOffs.includes(dayName) || holidays.some((h: any) => h.date === dateStr),
      trainers:  data?.duty_by_date?.[dateStr] || [],
    };
  });

  if (loading) return (
    <View style={s.loadingWrap}><Text style={s.loadingText}>Loading schedule...</Text></View>
  );

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
    >
      <Text style={s.pageTitle}>Schedule</Text>

      {/* Today status */}
      <View style={[s.todayCard, today?.is_closed ? s.todayClosed : s.todayOpen]}>
        <View style={[s.statusDot, { backgroundColor: today?.is_closed ? Colors.red : Colors.green }]} />
        <View>
          <Text style={[s.todayStatus, { color: today?.is_closed ? Colors.red : Colors.green }]}>
            {today?.is_closed ? 'Gym Closed Today' : 'Open Today'}
          </Text>
          {!today?.is_closed && today?.timings && (
            <Text style={s.todayHours}>{fmtTime(today.timings.open)} – {fmtTime(today.timings.close)}</Text>
          )}
          {today?.is_closed && today?.holiday && (
            <Text style={[s.todayHours, { color: Colors.red }]}>{today.holiday.title}</Text>
          )}
        </View>
      </View>

      {/* Week strip */}
      <SectionHeader title="This Week" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.weekScroll}>
        {next7.map((item) => <DayChip key={item.date} {...item} />)}
      </ScrollView>

      {/* Trainers on duty today */}
      {today?.trainers?.length > 0 && (
        <View style={s.section}>
          <SectionHeader title="Trainers on Duty Today" />
          {today.trainers.map((t: any, i: number) => (
            <TrainerRow key={i} name={t.name} specialization={t.specialization}
              shift={t.is_full_day ? 'Full Day' : `${fmtTime(t.shift_start)}–${fmtTime(t.shift_end)}`}
            />
          ))}
        </View>
      )}

      {/* Gym timings */}
      <SectionHeader title="Gym Timings" />
      <Card style={s.timingsCard}>
        <View style={s.timingRow}>
          <Text style={s.timingLabel}>Default Hours</Text>
          <Text style={s.timingValue}>{fmtTime(gym?.default_open || '06:00')} – {fmtTime(gym?.default_close || '22:00')}</Text>
        </View>
        {weeklyOffs.length > 0 && (
          <View style={[s.timingRow, s.timingBorder]}>
            <Text style={s.timingLabel}>Weekly Off</Text>
            <Text style={[s.timingValue, { color: Colors.red, textTransform: 'capitalize' }]}>{weeklyOffs.join(', ')}</Text>
          </View>
        )}
      </Card>

      {/* Holidays */}
      {holidays.length > 0 && (
        <View style={s.section}>
          <SectionHeader title="Upcoming Holidays" />
          {holidays.map((h: any) => <HolidayRow key={h.id} holiday={h} />)}
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll:         { flex: 1, backgroundColor: Colors.bg },
  content:        { padding: 20, paddingTop: 20, paddingBottom: 40 },
  loadingWrap:    { flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' },
  loadingText:    { color: Colors.text2, fontSize: 14 },
  pageTitle:      { fontSize: 28, fontWeight: '900', color: Colors.text, letterSpacing: 1, marginBottom: 20 },

  todayCard:      { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: Radius.md, borderWidth: 1, padding: 14, marginBottom: 20 },
  todayOpen:      { backgroundColor: Colors.greenBg, borderColor: Colors.green },
  todayClosed:    { backgroundColor: Colors.redBg, borderColor: Colors.red },
  statusDot:      { width: 10, height: 10, borderRadius: 5 },
  todayStatus:    { fontSize: 15, fontWeight: '700' },
  todayHours:     { fontSize: 13, color: Colors.text2, marginTop: 2 },

  weekScroll:     { marginBottom: 20 },
  dayCard:        { width: 56, marginRight: 8, backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, padding: 10, alignItems: 'center', gap: 6 },
  dayCardActive:  { backgroundColor: Colors.accentBg2, borderColor: Colors.accent },
  dayCardClosed:  { backgroundColor: Colors.redBg, borderColor: Colors.red },
  dayName:        { fontSize: 10, fontWeight: '700', color: Colors.muted },
  dayNameActive:  { color: Colors.accent },
  dayNum:         { fontSize: 20, fontWeight: '900', color: Colors.text },
  dayClosed:      { fontSize: 12, color: Colors.red },
  dayTrainers:    { fontSize: 10, color: Colors.accent },
  dayEmpty:       { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.border },

  section:        { marginBottom: 4 },
  timingsCard:    { marginBottom: 20 },
  timingRow:      { flexDirection: 'row', justifyContent: 'space-between', padding: 14 },
  timingBorder:   { borderTopWidth: 1, borderTopColor: Colors.border },
  timingLabel:    { fontSize: 13, color: Colors.text2 },
  timingValue:    { fontSize: 13, fontWeight: '600', color: Colors.text },

  holidayRow:     { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.redBg, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.red + '44', padding: 14, marginBottom: 8 },
  holidayTitle:   { fontSize: 14, fontWeight: '700', color: Colors.text },
  holidayReason:  { fontSize: 12, color: Colors.text2, marginTop: 2 },
  holidayDate:    { alignItems: 'center', marginLeft: 12 },
  holidayDateNum: { fontSize: 22, fontWeight: '900', color: Colors.red },
  holidayDateMonth: { fontSize: 10, fontWeight: '700', color: Colors.red },
});
