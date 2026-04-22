import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  RefreshControl, TouchableOpacity, Modal,
} from 'react-native';
import { supabase }       from '../../lib/supabase';
import { Colors, Radius } from '../../constants/theme';
import Card               from '../../components/ui/Card';
import Badge              from '../../components/ui/Badge';
import SectionHeader      from '../../components/ui/SectionHeader';
import InfoRow            from '../../components/ui/InfoRow';

function fmtDate(d: string) {
  if (!d) return '—';
  return new Date(d.includes('T') ? d : d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtCurrency(n: number) { return `₹${Number(n).toLocaleString('en-IN')}`; }
function fmtMethod(m: string)   { return (m || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()); }

// ── Receipt Modal ─────────────────────────────────────────────
function ReceiptModal({ payment, onClose }: { payment: any; onClose: () => void }) {
  if (!payment) return null;
  const sub = payment.subscription;

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet">
      <View style={r.container}>
        <View style={r.header}>
          <Text style={r.title}>Receipt</Text>
          <TouchableOpacity onPress={onClose} style={r.closeBtn}>
            <Text style={r.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={r.content}>
          <Text style={r.logo}>IRON<Text style={r.logoAccent}>FORGE</Text></Text>
          <Text style={r.receiptNo}>#{payment.id?.slice(-8).toUpperCase()}</Text>
          <Text style={r.date}>{fmtDate(payment.payment_date || payment.created_at)}</Text>

          <View style={r.divider} />

          <Card>
            <InfoRow label="Plan"           value={(sub?.plan?.billing_cycle || '').replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())} />
            <InfoRow label="Valid From"      value={fmtDate(sub?.start_date)} />
            <InfoRow label="Valid Until"     value={fmtDate(sub?.end_date)} />
            <InfoRow label="Payment Method"  value={fmtMethod(payment.payment_method)} />
            {payment.reference_no && <InfoRow label="Reference" value={payment.reference_no} border={false} />}
          </Card>

          <View style={r.amountBox}>
            <Text style={r.amountLabel}>Amount Paid</Text>
            <Text style={r.amountValue}>{fmtCurrency(payment.amount)}</Text>
          </View>

          <Text style={r.footer}>Official receipt · Keep for your records.</Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

// ── Payment Row ───────────────────────────────────────────────
function PaymentRow({ payment, onReceipt, isLast }: { payment: any; onReceipt: () => void; isLast: boolean }) {
  return (
    <View style={[s.row, !isLast && s.rowBorder]}>
      <View style={s.rowLeft}>
        <Text style={s.rowDate}>{fmtDate(payment.payment_date)}</Text>
        <Badge label={fmtMethod(payment.payment_method)} variant="yellow" size="sm" />
      </View>
      <View style={s.rowRight}>
        <Text style={s.rowAmount}>{fmtCurrency(payment.amount)}</Text>
        <TouchableOpacity style={s.receiptBtn} onPress={onReceipt} activeOpacity={0.7}>
          <Text style={s.receiptBtnText}>🧾 Receipt</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────
export default function PaymentsScreen() {
  const [payments,   setPayments]   = useState<any[]>([]);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected,   setSelected]   = useState<any>(null);

  const fetchPayments = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: member }   = await supabase.from('members').select('id').eq('profile_id', user!.id).single();
      if (!member) return;

      const { data } = await supabase
        .from('payments')
        .select(`
          id, amount, payment_method, payment_date, reference_no, created_at,
          subscription:member_subscriptions(start_date, end_date, plan:membership_plans(billing_cycle))
        `)
        .eq('member_id', member.id)
        .order('payment_date', { ascending: false });

      setPayments(data || []);
      setTotal((data || []).reduce((acc, p) => acc + Number(p.amount), 0));
    } catch (err: any) {
      console.error('Payments error:', err?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);
  function onRefresh() { setRefreshing(true); fetchPayments(); }

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
      >
        {/* Header */}
        <View style={s.header}>
          <Text style={s.pageTitle}>Payments</Text>
          <View style={s.totalBadge}>
            <Text style={s.totalLabel}>Total Paid</Text>
            <Text style={s.totalValue}>{fmtCurrency(total)}</Text>
          </View>
        </View>

        {loading ? (
          <Text style={s.emptyText}>Loading...</Text>
        ) : payments.length === 0 ? (
          <Text style={s.emptyText}>No payment records yet.</Text>
        ) : (
          <Card>
            {payments.map((p, i) => (
              <PaymentRow
                key={p.id}
                payment={p}
                onReceipt={() => setSelected(p)}
                isLast={i === payments.length - 1}
              />
            ))}
          </Card>
        )}
      </ScrollView>

      <ReceiptModal payment={selected} onClose={() => setSelected(null)} />
    </View>
  );
}

const s = StyleSheet.create({
  container:   { flex: 1, backgroundColor: Colors.bg },
  content:     { padding: 20, paddingTop: 20, paddingBottom: 40 },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  pageTitle:   { fontSize: 28, fontWeight: '900', color: Colors.text, letterSpacing: 1 },
  totalBadge:  { backgroundColor: Colors.accentBg2, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.accent, padding: 10, alignItems: 'flex-end' },
  totalLabel:  { fontSize: 9, fontWeight: '700', color: Colors.accent, letterSpacing: 1.5, textTransform: 'uppercase' },
  totalValue:  { fontSize: 20, fontWeight: '900', color: Colors.accent },
  emptyText:   { color: Colors.muted, textAlign: 'center', marginTop: 40, fontSize: 14 },
  row:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  rowBorder:   { borderBottomWidth: 1, borderBottomColor: Colors.border },
  rowLeft:     { gap: 6 },
  rowDate:     { fontSize: 14, fontWeight: '600', color: Colors.text },
  rowRight:    { alignItems: 'flex-end', gap: 6 },
  rowAmount:   { fontSize: 22, fontWeight: '900', color: Colors.green },
  receiptBtn:  { backgroundColor: Colors.card2, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border2, paddingHorizontal: 10, paddingVertical: 5 },
  receiptBtnText: { fontSize: 11, fontWeight: '700', color: Colors.accent },
});

const r = StyleSheet.create({
  container:   { flex: 1, backgroundColor: Colors.bg },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 20, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title:       { fontSize: 18, fontWeight: '800', color: Colors.text },
  closeBtn:    { width: 32, height: 32, backgroundColor: Colors.card2, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  closeText:   { color: Colors.text2, fontSize: 14 },
  content:     { padding: 24 },
  logo:        { fontSize: 28, fontWeight: '900', color: Colors.text, letterSpacing: 3, marginBottom: 4 },
  logoAccent:  { color: Colors.accent },
  receiptNo:   { fontSize: 13, color: Colors.text2, marginBottom: 2 },
  date:        { fontSize: 12, color: Colors.muted, marginBottom: 20 },
  divider:     { height: 1, backgroundColor: Colors.border, marginBottom: 16 },
  amountBox:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.accentBg2, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.accent, padding: 16, marginTop: 16, marginBottom: 24 },
  amountLabel: { fontSize: 13, fontWeight: '700', color: Colors.text2, textTransform: 'uppercase', letterSpacing: 1 },
  amountValue: { fontSize: 28, fontWeight: '900', color: Colors.accent },
  footer:      { fontSize: 11, color: Colors.muted, textAlign: 'center' },
});
