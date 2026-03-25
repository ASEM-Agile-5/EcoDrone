import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';

type NavigationProp = NativeStackNavigationProp<any>;

interface Order {
  id: string;
  vendor: string;
  amount: string;
  date: string;
  status: 'In Transit' | 'Preparing' | 'Delivered' | 'Cancelled';
  imageUrl: string;
}

const currentOrder: Order = {
  id: '1',
  vendor: 'Akornor',
  amount: 'GH₵72.00',
  date: '15 Jan, 2026 2:30 PM',
  status: 'In Transit',
  imageUrl: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400',
};

const pastOrders: Order[] = [
  {
    id: '2',
    vendor: 'Hallmark',
    amount: 'GH₵113.00',
    date: '15 Jan, 2026 1:51 PM',
    status: 'Delivered',
    imageUrl: 'https://images.unsplash.com/photo-1665332195309-9d75071138f0?w=400',
  },
  {
    id: '3',
    vendor: 'Campus Café',
    amount: 'GH₵175.00',
    date: '10 Jan, 2026 7:42 PM',
    status: 'Delivered',
    imageUrl: 'https://images.unsplash.com/photo-1650815232474-12d5b9375d63?w=400',
  },
  {
    id: '4',
    vendor: 'Quick Bites',
    amount: 'GH₵141.49',
    date: '10 Jan, 2026 6:49 PM',
    status: 'Cancelled',
    imageUrl: 'https://images.unsplash.com/photo-1682423187670-4817da9a1b23?w=400',
  },
  {
    id: '5',
    vendor: 'Akornor',
    amount: 'GH₵83.49',
    date: '10 Jan, 2026 12:04 PM',
    status: 'Delivered',
    imageUrl: 'https://images.unsplash.com/photo-1590488271114-d65198ae0717?w=400',
  },
  {
    id: '6',
    vendor: 'Hallmark',
    amount: 'GH₵108.19',
    date: '08 Jan, 2026 7:02 PM',
    status: 'Delivered',
    imageUrl: 'https://images.unsplash.com/photo-1665332195309-9d75071138f0?w=400',
  },
  {
    id: '7',
    vendor: 'Campus Café',
    amount: 'GH₵116.49',
    date: '08 Jan, 2026 2:38 PM',
    status: 'Delivered',
    imageUrl: 'https://images.unsplash.com/photo-1650815232474-12d5b9375d63?w=400',
  },
];

function statusColor(status: Order['status']) {
  switch (status) {
    case 'In Transit':
    case 'Preparing':
      return colors.info;
    case 'Delivered':
      return colors.success;
    case 'Cancelled':
      return colors.danger;
    default:
      return colors.gray500;
  }
}

export default function OrdersScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  const handleOrderPress = (order: Order) => {
    if (order.status === 'In Transit' || order.status === 'Preparing') {
      navigation.navigate('OrderTracking', { orderId: order.id });
    } else {
      navigation.navigate('OrderBreakdown', { orderId: order.id });
    }
  };

  const OrderCard = ({ order }: { order: Order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => handleOrderPress(order)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: order.imageUrl }} style={styles.orderImage} resizeMode="cover" />
      <View style={styles.orderInfo}>
        <Text style={styles.orderVendor}>{order.vendor}</Text>
        <Text style={styles.orderAmount}>{order.amount}</Text>
        <View style={styles.orderMeta}>
          <Text style={styles.orderDate}>{order.date}</Text>
          <Text style={styles.dot}> • </Text>
          <Text style={[styles.orderStatus, { color: statusColor(order.status) }]}>
            {order.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.flex}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Order */}
        <View>
          <Text style={styles.sectionLabel}>CURRENT ORDER</Text>
          <OrderCard order={currentOrder} />
        </View>

        {/* Past Orders */}
        <View style={{ marginTop: 8 }}>
          <Text style={styles.sectionLabel}>PAST ORDERS</Text>
          <View style={styles.pastList}>
            {pastOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
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
  headerTitle: { fontSize: 28, fontWeight: '700', color: colors.white },
  content: { padding: 16, gap: 12 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.gray500,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 10,
  },
  orderImage: {
    width: 76,
    height: 76,
    borderRadius: 10,
  },
  orderInfo: { flex: 1, gap: 3 },
  orderVendor: { fontSize: 15, fontWeight: '600', color: colors.text },
  orderAmount: { fontSize: 17, fontWeight: '700', color: colors.text },
  orderMeta: { flexDirection: 'row', alignItems: 'center' },
  orderDate: { fontSize: 12, color: colors.gray500 },
  dot: { fontSize: 12, color: colors.gray400 },
  orderStatus: { fontSize: 12, fontWeight: '500' },
  pastList: { gap: 0 },
});
