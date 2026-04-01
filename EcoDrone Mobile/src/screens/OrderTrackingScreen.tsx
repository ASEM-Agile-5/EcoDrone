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
import StatusIndicator from '../components/StatusIndicator';
import TrackingMapCard from '../components/TrackingMapCard';
import { colors } from '../theme/colors';
import { getLocationsAPI, getOrderDetailsAPI } from 'services/services';
import { Order } from 'models/order';
import { Location } from 'models/location';

type NavigationProp = NativeStackNavigationProp<any>;
type RouteType = RouteProp<{ OrderTracking: { orderId: string } }, 'OrderTracking'>;

function getTrackingSteps(order: Order | null) {
  const normalized = order?.status?.toLowerCase() ?? '';
  const hasAssignedDrone = Boolean(order?.assigned_drone);
  const isDelivered = ['delivered', 'completed'].includes(normalized);
  const isPreparing = ['preparing', 'in progress'].includes(normalized);
  const isDispatched = ['dispatched', 'in transit'].includes(normalized);
  const pendingAccepted = hasAssignedDrone || isPreparing || isDispatched || isDelivered;
  const droneAssignedDone = isPreparing || isDispatched || isDelivered;
  const preparingDone = isDispatched || isDelivered;

  return [
    {
      label: 'Pending Acceptance',
      completed: pendingAccepted,
      active: normalized === 'pending' && !hasAssignedDrone,
    },
    {
      label: 'Drone Assigned',
      completed: droneAssignedDone,
      active: hasAssignedDrone && normalized === 'pending',
    },
    {
      label: 'Preparing',
      completed: preparingDone,
      active: isPreparing,
    },
    {
      label: 'Drone Dispatched',
      completed: isDispatched || isDelivered,
      active: false,
    },
    {
      label: 'Delivered',
      completed: isDelivered,
      active: false,
    },
  ];
}

export default function OrderTrackingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const insets = useSafeAreaInsets();
  const orderId = route.params?.orderId;

  const [order, setOrder] = useState<Order | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      let active = true;

      const fetchOrder = async () => {
        setLoading(true);
        setError('');
        try {
          const [orderData, locationData] = await Promise.all([
            getOrderDetailsAPI(orderId),
            getLocationsAPI(),
          ]);
          if (active) {
            setOrder(orderData ?? null);
            setLocations(Array.isArray(locationData) ? locationData : []);
          }
        } catch (err) {
          if (active) {
            setError('Failed to load order tracking details.');
            setOrder(null);
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };

      fetchOrder();

      return () => {
        active = false;
      };
    }, [orderId]),
  );

  const trackingSteps = getTrackingSteps(order);
  const subtotal = order?.total_amount ? Number(order.total_amount) : 0;
  const vendorName = order?.vendor_name ?? '—';
  const vendorInitial = vendorName.trim().charAt(0).toUpperCase() || 'E';
  const matchedLocation =
    locations.find((location) => location.name === order?.location) ?? null;

  return (
    <View style={styles.flex}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Tracking</Text>
        <Text style={styles.headerSubtitle}>Track your delivery in real-time</Text>
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
              <Text style={styles.cardTitle}>Delivery Status</Text>
              <StatusIndicator steps={trackingSteps} />

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={[styles.iconCircle, { backgroundColor: colors.successLight }]}>
                  <Ionicons name="time-outline" size={20} color={colors.success} />
                </View>
                <View>
                  <Text style={styles.infoLabel}>Estimated Delivery</Text>
                  <Text style={styles.infoValue}>
                    {order?.status === 'Pending' && !order?.assigned_drone
                      ? 'Waiting for acceptance'
                      : order?.assigned_drone && order?.status === 'Pending'
                      ? `Assigned to ${order.assigned_drone}`
                      : order?.status === 'Dispatched'
                      ? 'Drone dispatched'
                      : order?.status === 'In Transit'
                      ? 'In transit now'
                      : order?.status === 'Completed' || order?.status === 'Delivered'
                      ? 'Delivered'
                      : 'Preparing order'}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={[styles.iconCircle, { backgroundColor: colors.infoLight }]}>
                  <Ionicons name="location-outline" size={20} color={colors.info} />
                </View>
                <View>
                  <Text style={styles.infoLabel}>Delivery Location</Text>
                  <Text style={styles.infoValue}>{order?.location || '—'}</Text>
                </View>
              </View>
            </View>

            <TrackingMapCard
              vendorName={vendorName}
              locationName={order?.location || '—'}
              locationCoords={
                matchedLocation
                  ? {
                      latitude: matchedLocation.latitude,
                      longitude: matchedLocation.longitude,
                    }
                  : null
              }
              status={order?.status || ''}
              assignedDrone={order?.assigned_drone}
            />

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Order Details</Text>

              {order?.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <View key={`${item.name}-${index}`} style={styles.orderItem}>
                    <View>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                    </View>
                    <Text style={styles.itemPrice}>GH₵{(Number(item.price) * item.quantity).toFixed(2)}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No item details available</Text>
              )}

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>GH₵{subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee</Text>
                <Text style={styles.freeText}>Free</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>GH₵{subtotal.toFixed(2)}</Text>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.vendorRow}>
                <View style={styles.vendorAvatar}>
                  <Text style={styles.vendorInitial}>{vendorInitial}</Text>
                </View>
                <View style={styles.vendorInfo}>
                  <Text style={styles.vendorName}>{vendorName}</Text>
                  <Text style={styles.vendorMsg}>
                    {order?.assigned_drone
                      ? `Assigned to ${order.assigned_drone}`
                      : 'Your order is being prepared with care'}
                  </Text>
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
    gap: 14,
  },
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  stateText: { fontSize: 14, color: colors.gray500 },
  errorText: { fontSize: 14, color: colors.danger, textAlign: 'center' },
  emptyText: { fontSize: 14, color: colors.gray500, textAlign: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  divider: { height: 1, backgroundColor: colors.border },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: { fontSize: 12, color: colors.gray500 },
  infoValue: { fontSize: 14, fontWeight: '600', color: colors.text },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: { fontSize: 14, fontWeight: '500', color: colors.text },
  itemQty: { fontSize: 12, color: colors.gray500, marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: '600', color: colors.text },
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
  vendorRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  vendorAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vendorInitial: { fontSize: 22, fontWeight: '700', color: colors.white },
  vendorInfo: { flex: 1 },
  vendorName: { fontSize: 15, fontWeight: '600', color: colors.text },
  vendorMsg: { fontSize: 13, color: colors.gray500, marginTop: 2 },
});
