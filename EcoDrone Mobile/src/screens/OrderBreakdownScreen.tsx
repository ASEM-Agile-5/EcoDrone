import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { Order } from 'models/order';
import { getOrderDetailsAPI } from 'services/services';

type NavigationProp = NativeStackNavigationProp<any>;
type RouteType = RouteProp<{ OrderBreakdown: { orderId: string; order?: Order } }, 'OrderBreakdown'>;
const LIVE_REFRESH_INTERVAL_MS = 5000;

function statusBadgeStyle(status: string) {
  switch (status?.toLowerCase()) {
    case 'delivered':
    case 'completed':
      return { bg: colors.successLight, text: colors.success };
    case 'cancelled':
    case 'failed':
      return { bg: '#fde8e8', text: colors.danger };
    case 'in transit':
    case 'preparing':
    case 'in progress':
    case 'pending':
      return { bg: colors.infoLight, text: colors.info };
    default:
      return { bg: colors.gray100, text: colors.gray500 };
  }
}

function formatDate(timestamp: string) {
  try {
    const d = new Date(timestamp);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }) + ' ' + d.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return timestamp;
  }
}

export default function OrderBreakdownScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const insets = useSafeAreaInsets();

  const initialOrder = route.params?.order;
  const orderId = route.params?.orderId || initialOrder?.order_id || '—';
  const [order, setOrder] = useState<Order | null>(initialOrder ?? null);
  const [loading, setLoading] = useState(!initialOrder);
  const [error, setError] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      let active = true;

      const fetchOrder = async (showLoading = false) => {
        if (showLoading) {
          setLoading(true);
        }

        try {
          const data = await getOrderDetailsAPI(orderId);
          if (active) {
            setError('');
            setOrder(data ?? null);
          }
        } catch {
          if (active && showLoading) {
            setError('Failed to load order details.');
          }
        } finally {
          if (active && showLoading) {
            setLoading(false);
          }
        }
      };

      void fetchOrder(true);

      const interval = setInterval(() => {
        void fetchOrder(false);
      }, LIVE_REFRESH_INTERVAL_MS);

      return () => {
        active = false;
        clearInterval(interval);
      };
    }, [orderId]),
  );

  const totalAmount = Number(order?.total_amount ?? 0);
  const badge = statusBadgeStyle(order?.status || '');
  const vendorName = order?.vendor_name ?? '—';

  return (
    <View style={styles.flex}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <Text style={styles.headerSubtitle}>Order #{orderId.slice(0, 8)}</Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.stateText}>Loading order details...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerState}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <View style={styles.statusRow}>
                <View>
                  <Text style={styles.vendorName}>{vendorName}</Text>
                  <Text style={styles.orderDate}>{formatDate(order?.timestamp || '')}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                  <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                    {order?.status || '—'}
                  </Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View>
                <Text style={styles.fieldLabel}>Delivery Location</Text>
                <Text style={styles.fieldValue}>{order?.location || '—'}</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Order Items</Text>
              {order?.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <View key={`${item.name}-${index}`} style={styles.itemRow}>
                    <View>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                    </View>
                    <Text style={styles.itemPrice}>
                      GH₵{(Number(item.price) * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No item details available</Text>
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Payment Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>GH₵{totalAmount.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee</Text>
                <Text style={styles.freeText}>Free</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Service Fee</Text>
                <Text style={styles.summaryValue}>GH₵0.00</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>GH₵{totalAmount.toFixed(2)}</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Drone Assignment</Text>
              <View style={styles.paymentRow}>
                <View style={styles.paymentIcon}>
                  <Ionicons name="airplane-outline" size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.paymentTitle}>
                    {order?.assigned_drone ? `Drone: ${order.assigned_drone}` : 'Not Assigned Yet'}
                  </Text>
                  <Text style={styles.paymentSub}>
                    {order?.assigned_drone ? 'Drone delivery' : 'Pending drone assignment'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Payment Method</Text>
              <View style={styles.paymentRow}>
                <View style={styles.paymentIcon}>
                  <Text style={styles.paymentEmoji}>💳</Text>
                </View>
                <View>
                  <Text style={styles.paymentTitle}>Mobile Money</Text>
                  <Text style={styles.paymentSub}>MoMo Payment</Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backBtn: { marginBottom: 14 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: colors.white },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  content: { padding: 16, gap: 14 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
    gap: 12,
  },
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  stateText: { fontSize: 14, color: colors.gray500 },
  errorText: { fontSize: 14, color: colors.danger, textAlign: 'center' },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  vendorName: { fontSize: 15, fontWeight: '600', color: colors.text },
  orderDate: { fontSize: 13, color: colors.gray500, marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusBadgeText: { fontSize: 12, fontWeight: '500' },
  divider: { height: 1, backgroundColor: colors.border },
  fieldLabel: { fontSize: 12, color: colors.gray500 },
  fieldValue: { fontSize: 14, fontWeight: '500', color: colors.text, marginTop: 2 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: { fontSize: 14, fontWeight: '500', color: colors.text },
  itemQty: { fontSize: 12, color: colors.gray500, marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: '600', color: colors.text },
  emptyText: {
    fontSize: 14,
    color: colors.gray400,
    textAlign: 'center',
    paddingVertical: 12,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontSize: 14, color: colors.gray600 },
  summaryValue: { fontSize: 14, color: colors.gray700 },
  freeText: { fontSize: 14, fontWeight: '500', color: colors.success },
  totalRow: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: { fontSize: 16, fontWeight: '700', color: colors.text },
  totalValue: { fontSize: 16, fontWeight: '700', color: colors.primary },
  paymentRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  paymentIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentEmoji: { fontSize: 20 },
  paymentTitle: { fontSize: 14, fontWeight: '500', color: colors.text },
  paymentSub: { fontSize: 12, color: colors.gray500, marginTop: 2 },
});
