import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors } from "../theme/colors";
import { UserOrders, Order } from "models/order";
import { getUserOrdersAPI } from "services/services";

type NavigationProp = NativeStackNavigationProp<any>;
const LIVE_REFRESH_INTERVAL_MS = 5000;

function isTrackingStatus(status: Order["status"]) {
  return ["Pending", "Dispatched", "Preparing", "In Progress", "In Transit"].some(
    (value) => value.toLowerCase() === status?.toLowerCase(),
  );
}

function statusColor(status: Order["status"]) {
  switch (status?.toLowerCase()) {
    case "pending":
    case "dispatched":
    case "in transit":
    case "preparing":
    case "in progress":
      return colors.info;
    case "delivered":
    case "completed":
      return colors.success;
    case "cancelled":
    case "failed":
      return colors.danger;
    default:
      return colors.gray500;
  }
}

export default function OrdersScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const [currentOrder, setCurrentOrders] = useState<Order[]>([]);
  const [pastOrders, setPastOrders] = useState<Order[]>([]);

  const fetchOrders = async () => {
    try {
      const data = await getUserOrdersAPI();
      console.log(data);
      setCurrentOrders(data.current_orders || []);
      setPastOrders(data.past_orders || []);
    } catch (error) {
      console.error("Failed to fetch menus:", error);
      setCurrentOrders([]);
      setPastOrders([]);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      void fetchOrders();

      const interval = setInterval(() => {
        void fetchOrders();
      }, LIVE_REFRESH_INTERVAL_MS);

      return () => clearInterval(interval);
    }, []),
  );

  const handleOrderPress = (order: Order) => {
    if (isTrackingStatus(order.status)) {
      navigation.navigate("OrderTracking", { orderId: order.order_id });
    } else {
      navigation.navigate("OrderBreakdown", { orderId: order.order_id, order });
    }
  };

  const OrderCard = ({ order }: { order: Order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => handleOrderPress(order)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: order?.vendor_image_url ?? order?.image_url ?? undefined }}
        style={styles.orderImage}
        resizeMode="cover"
      />
      <View style={styles.orderInfo}>
        <View style={styles.orderRow}>
          <Text style={styles.orderVendor}>{order?.vendor_name ?? order?.vendor}</Text>
          <Text style={[styles.orderStatus, { color: statusColor(order?.status) }]}>{order?.status}</Text>
        </View>
        {order?.items?.slice(0, 2).map((item, i) => (
          <Text key={i} style={styles.orderItem} numberOfLines={1}>
            {item.quantity}x {item.name}
          </Text>
        ))}
        {order?.items?.length > 2 ? (
          <Text style={styles.orderItemMore}>+{order.items.length - 2} more</Text>
        ) : null}
        {order?.total_amount ? (
          <Text style={styles.orderAmount}>GH₵{order.total_amount}</Text>
        ) : null}
        {order?.timestamp ? (
          <Text style={styles.orderDate}>{new Date(order.timestamp).toLocaleDateString()}</Text>
        ) : null}
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
        {currentOrder.length > 0 ? (
          <View>
            <Text style={styles.sectionLabel}>CURRENT ORDER</Text>
            <OrderCard order={currentOrder[0]} />
          </View>
        ) : null}

        {/* Past Orders */}
        <View style={{ marginTop: currentOrder.length > 0 ? 8 : 0 }}>
          <Text style={styles.sectionLabel}>PAST ORDERS</Text>
          {pastOrders.length > 0 ? (
            <View style={styles.pastList}>
              {pastOrders.map((order) => (
                <OrderCard key={order?.order_id} order={order} />
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No past orders</Text>
          )}
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
  headerTitle: { fontSize: 28, fontWeight: "700", color: colors.white },
  content: { padding: 16, gap: 12 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.gray500,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 14,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  orderImage: {
    width: 84,
    height: 84,
    borderRadius: 10,
    backgroundColor: colors.gray100,
  },
  orderInfo: { flex: 1, gap: 4 },
  orderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  orderVendor: { fontSize: 15, fontWeight: "600", color: colors.text, flex: 1, marginRight: 8 },
  orderItem: { fontSize: 13, color: colors.gray600 },
  orderItemMore: { fontSize: 12, color: colors.gray400 },
  orderAmount: { fontSize: 15, fontWeight: "700", color: colors.text },
  orderDate: { fontSize: 12, color: colors.gray400 },
  dot: { fontSize: 12, color: colors.gray400 },
  orderStatus: { fontSize: 12, fontWeight: "600" },
  pastList: { gap: 0 },
  emptyText: { fontSize: 14, color: colors.gray500, textAlign: "center", paddingVertical: 20 },
});
