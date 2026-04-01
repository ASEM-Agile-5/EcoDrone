import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors } from "../theme/colors";
import { UserOrders, Order } from "models/order";
import { getUserOrdersAPI } from "services/services";

type NavigationProp = NativeStackNavigationProp<any>;

function statusColor(status: Order["status"]) {
  switch (status) {
    case "In Transit":
    case "Preparing":
      return colors.info;
    case "Delivered":
      return colors.success;
    case "Cancelled":
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

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOrderPress = (order: Order) => {
    if (order.status === "In Transit" || order.status === "Preparing") {
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
        source={{ uri: order?.image_url }}
        style={styles.orderImage}
        resizeMode="cover"
      />
      <View style={styles.orderInfo}>
        <Text style={styles.orderVendor}>{order?.vendor}</Text>
        <Text style={styles.orderAmount}>{order?.total_amount}</Text>
        <View style={styles.orderMeta}>
          <Text style={styles.orderDate}>{order?.timestamp}</Text>
          <Text style={styles.dot}> • </Text>
          <Text
            style={[styles.orderStatus, { color: statusColor(order?.status) }]}
          >
            {order?.status}
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
          <OrderCard order={currentOrder[0]} />
        </View>

        {/* Past Orders */}
        <View style={{ marginTop: 8 }}>
          <Text style={styles.sectionLabel}>PAST ORDERS</Text>
          <View style={styles.pastList}>
            {pastOrders.map((order) => (
              <OrderCard key={order?.order_id} order={order} />
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
  orderVendor: { fontSize: 15, fontWeight: "600", color: colors.text },
  orderAmount: { fontSize: 17, fontWeight: "700", color: colors.text },
  orderMeta: { flexDirection: "row", alignItems: "center" },
  orderDate: { fontSize: 12, color: colors.gray500 },
  dot: { fontSize: 12, color: colors.gray400 },
  orderStatus: { fontSize: 12, fontWeight: "500" },
  pastList: { gap: 0 },
});
