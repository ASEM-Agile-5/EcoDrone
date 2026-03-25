import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import StatusIndicator from '../components/StatusIndicator';
import { colors } from '../theme/colors';

type NavigationProp = NativeStackNavigationProp<any>;

const steps = [
  { label: 'Preparing', completed: true, active: false },
  { label: 'In Transit', completed: false, active: true },
  { label: 'Delivered', completed: false, active: false },
];

export default function OrderTrackingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.flex}>
      {/* Header */}
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
        {/* Status Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery Status</Text>
          <StatusIndicator steps={steps} />

          <View style={styles.divider} />

          {/* ETA */}
          <View style={styles.infoRow}>
            <View style={[styles.iconCircle, { backgroundColor: colors.successLight }]}>
              <Ionicons name="time-outline" size={20} color={colors.success} />
            </View>
            <View>
              <Text style={styles.infoLabel}>Estimated Delivery</Text>
              <Text style={styles.infoValue}>8-12 minutes</Text>
            </View>
          </View>

          {/* Location */}
          <View style={styles.infoRow}>
            <View style={[styles.iconCircle, { backgroundColor: colors.infoLight }]}>
              <Ionicons name="location-outline" size={20} color={colors.info} />
            </View>
            <View>
              <Text style={styles.infoLabel}>Delivery Location</Text>
              <Text style={styles.infoValue}>CS Lab, Block 7</Text>
            </View>
          </View>
        </View>

        {/* Order Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Details</Text>

          <View style={styles.orderItem}>
            <View>
              <Text style={styles.itemName}>Jollof Rice with Chicken</Text>
              <Text style={styles.itemQty}>Qty: 2</Text>
            </View>
            <Text style={styles.itemPrice}>GH₵50</Text>
          </View>

          <View style={styles.orderItem}>
            <View>
              <Text style={styles.itemName}>Fried Rice Special</Text>
              <Text style={styles.itemQty}>Qty: 1</Text>
            </View>
            <Text style={styles.itemPrice}>GH₵22</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>GH₵72</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.freeText}>Free</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>GH₵72</Text>
          </View>
        </View>

        {/* Vendor Card */}
        <View style={styles.card}>
          <View style={styles.vendorRow}>
            <View style={styles.vendorAvatar}>
              <Text style={styles.vendorInitial}>A</Text>
            </View>
            <View style={styles.vendorInfo}>
              <Text style={styles.vendorName}>Akornor</Text>
              <Text style={styles.vendorMsg}>Your order is being prepared with care</Text>
            </View>
          </View>
        </View>
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
