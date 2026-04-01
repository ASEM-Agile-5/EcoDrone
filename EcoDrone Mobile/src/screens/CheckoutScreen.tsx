import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import CustomButton from "../components/CustomButton";
import { colors } from "../theme/colors";
import { placeOrderAPI, getUserOrdersAPI } from "services/services";

type NavigationProp = NativeStackNavigationProp<any>;
type RouteType = RouteProp<
  { Checkout: { vendor: any; deliveryLocation: string; cartItems: any[] } },
  "Checkout"
>;

const NETWORKS = ["MTN Mobile Money", "Vodafone Cash", "AirtelTigo Money"];

export default function CheckoutScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const insets = useSafeAreaInsets();

  const vendor = route.params?.vendor || { name: "Akornor" };
  const deliveryLocation = route.params?.deliveryLocation || "CS Lab, Block 7";
  const cartItems = route.params?.cartItems || [
    { name: "Jollof Rice with Chicken", quantity: 2, price: 25 },
    { name: "Fried Rice Special", quantity: 1, price: 22 },
  ];

  const [phone, setPhone] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState(0);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [networkOpen, setNetworkOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"momo" | "paystack">(
    "momo",
  );
  const [placing, setPlacing] = useState(false);
  const [showCurrentOrderModal, setShowCurrentOrderModal] = useState(false);

  const subtotal = cartItems.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0,
  );
  const total = subtotal;

  const goToOrdersTab = () => {
    const tabNavigation = navigation.getParent() as any;
    if (tabNavigation) {
      tabNavigation.navigate("OrdersTab", {
        screen: "Orders",
      });
      return;
    }

    (navigation as any).navigate("Main", {
      screen: "OrdersTab",
      params: { screen: "Orders" },
    });
  };

  if (orderPlaced) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successCard}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={40} color={colors.success} />
          </View>
          <Text style={styles.successTitle}>Order Placed Successfully!</Text>
          <Text style={styles.successMessage}>
            Your order from {vendor.name} has been confirmed and is being
            prepared.
          </Text>
          <CustomButton
            onPress={goToOrdersTab}
            fullWidth
          >
            Track Order
          </CustomButton>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <Text style={styles.headerSubtitle}>
          Review and complete your order
        </Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Delivery Details */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Delivery Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Vendor</Text>
              <Text style={styles.detailValue}>{vendor.name}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Delivery Location</Text>
              <Text style={styles.detailValue}>{deliveryLocation}</Text>
            </View>
          </View>

          {/* Order Items */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Order Summary</Text>
            {cartItems.map((item: any, index: number) => (
              <View key={index} style={styles.orderItem}>
                <View>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                </View>
                <Text style={styles.itemTotal}>
                  GH₵{item.price * item.quantity}
                </Text>
              </View>
            ))}
          </View>

          {/* Payment Summary */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Payment Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>GH₵{subtotal}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.freeText}>Free</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>GH₵{total}</Text>
            </View>
          </View>

          {/* Payment Method */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Payment Method</Text>

            {/* Mobile Money Option */}
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === "momo" && styles.paymentOptionActive,
              ]}
              onPress={() => setPaymentMethod("momo")}
              activeOpacity={0.7}
            >
              <View style={styles.momoIcon}>
                <Text style={styles.momoEmoji}>📱</Text>
              </View>
              <View style={styles.momoInfo}>
                <Text style={styles.momoTitle}>Mobile Money</Text>
                <Text style={styles.momoSub}>MTN, Vodafone, AirtelTigo</Text>
              </View>
              <View
                style={
                  paymentMethod === "momo"
                    ? styles.radioSelected
                    : styles.radioUnselected
                }
              >
                {paymentMethod === "momo" && (
                  <Ionicons name="checkmark" size={14} color={colors.white} />
                )}
              </View>
            </TouchableOpacity>

            {/* PayStack Option */}
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === "paystack" && styles.paymentOptionActive,
              ]}
              onPress={() => setPaymentMethod("paystack")}
              activeOpacity={0.7}
            >
              <View style={styles.paystackIcon}>
                <Text style={styles.paystackText}>P</Text>
              </View>
              <View style={styles.momoInfo}>
                <Text style={styles.momoTitle}>PayStack</Text>
                <Text style={styles.momoSub}>Card, Bank Transfer, USSD</Text>
              </View>
              <View
                style={
                  paymentMethod === "paystack"
                    ? styles.radioSelected
                    : styles.radioUnselected
                }
              >
                {paymentMethod === "paystack" && (
                  <Ionicons name="checkmark" size={14} color={colors.white} />
                )}
              </View>
            </TouchableOpacity>

            {/* Mobile Money Fields */}
            {paymentMethod === "momo" && (
              <>
                {/* Phone Number */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Phone Number</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="024 123 4567"
                    placeholderTextColor={colors.gray400}
                    keyboardType="phone-pad"
                  />
                </View>

                {/* Network Selector */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Network</Text>
                  <TouchableOpacity
                    style={styles.fieldInput}
                    onPress={() => setNetworkOpen(!networkOpen)}
                  >
                    <Text style={styles.networkText}>
                      {NETWORKS[selectedNetwork]}
                    </Text>
                    <Ionicons
                      name={networkOpen ? "chevron-up" : "chevron-down"}
                      size={16}
                      color={colors.gray500}
                    />
                  </TouchableOpacity>
                  {networkOpen && (
                    <View style={styles.dropdown}>
                      {NETWORKS.map((n, i) => (
                        <TouchableOpacity
                          key={n}
                          style={[
                            styles.dropdownItem,
                            i === NETWORKS.length - 1 && styles.dropdownLast,
                          ]}
                          onPress={() => {
                            setSelectedNetwork(i);
                            setNetworkOpen(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.dropdownText,
                              selectedNetwork === i && styles.dropdownActive,
                            ]}
                          >
                            {n}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </>
            )}

            {/* PayStack Info */}
            {paymentMethod === "paystack" && (
              <View style={styles.paystackInfo}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={18}
                  color={colors.primary}
                />
                <Text style={styles.paystackInfoText}>
                  You will be redirected to PayStack to complete your payment
                  securely.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
        <CustomButton
          onPress={async () => {
            // if (!userId) {
            //   Alert.alert("Error", "You must be logged in to place an order.");
            //   return;
            // }
            setPlacing(true);
            try {
              // Check for existing current orders first
              const ordersData = await getUserOrdersAPI();
              console.log(ordersData);
              if (
                ordersData?.current_orders &&
                ordersData.current_orders.length > 0
              ) {
                setPlacing(false);
                setShowCurrentOrderModal(true);
                return;
              }

              await placeOrderAPI({
                vendor: vendor.id,
                timestamp: new Date().toISOString(),
                location: deliveryLocation,
                total_amount: total,
                items: cartItems.map((item: any) => ({
                  name: item.name,
                  quantity: item.quantity,
                  price: item.price,
                })),
              });
              Alert.alert(
                "Success",
                "Your order has been placed successfully!",
              );
              navigation.reset({
                index: 0,
                routes: [{ name: "Main", params: { screen: "HomeTab" } }],
              });
            } catch (error) {
              console.error("Order placement failed:", error);
              Alert.alert(
                "Order Failed",
                "Something went wrong. Please try again.",
              );
            } finally {
              setPlacing(false);
            }
          }}
          fullWidth
          disabled={placing}
        >
          {placing ? "Placing Order..." : `Complete Order • GH₵${total}`}
        </CustomButton>
      </View>

      {/* Current Order Modal */}
      <Modal
        visible={showCurrentOrderModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCurrentOrderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconCircle}>
              <Ionicons
                name="warning-outline"
                size={32}
                color={colors.warning}
              />
            </View>
            <Text style={styles.modalTitle}>Active Order In Progress</Text>
            <Text style={styles.modalMessage}>
              You currently have an ongoing order. Please complete or wait for
              your current order to be delivered before placing a new one.
            </Text>
            <View style={styles.modalActions}>
              <CustomButton
                onPress={() => {
                  setShowCurrentOrderModal(false);
                  goToOrdersTab();
                }}
                fullWidth
              >
                View My Orders
              </CustomButton>
              <TouchableOpacity
                style={styles.modalDismiss}
                onPress={() => setShowCurrentOrderModal(false)}
              >
                <Text style={styles.modalDismissText}>Go Back</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  headerTitle: { fontSize: 22, fontWeight: "700", color: colors.white },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
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
  cardTitle: { fontSize: 15, fontWeight: "600", color: colors.text },
  detailRow: { gap: 2 },
  detailLabel: { fontSize: 13, color: colors.gray500 },
  detailValue: { fontSize: 14, fontWeight: "500", color: colors.text },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  itemName: { fontSize: 14, fontWeight: "500", color: colors.text },
  itemQty: { fontSize: 13, color: colors.gray500 },
  itemTotal: { fontSize: 14, fontWeight: "600", color: colors.text },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryLabel: { fontSize: 14, color: colors.gray600 },
  summaryValue: { fontSize: 14, color: colors.gray700 },
  freeText: { fontSize: 14, fontWeight: "500", color: colors.success },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: { fontSize: 16, fontWeight: "700", color: colors.text },
  totalValue: { fontSize: 16, fontWeight: "700", color: colors.primary },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderWidth: 2,
    borderColor: colors.gray200,
    borderRadius: 10,
    backgroundColor: colors.white,
    gap: 12,
  },
  paymentOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  momoIcon: {
    width: 44,
    height: 44,
    backgroundColor: colors.amberLight,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  momoEmoji: { fontSize: 22 },
  momoInfo: { flex: 1 },
  momoTitle: { fontSize: 14, fontWeight: "500", color: colors.text },
  momoSub: { fontSize: 12, color: colors.gray500 },
  paystackIcon: {
    width: 44,
    height: 44,
    backgroundColor: "#E8F5FE",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  paystackText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0BA4DB",
  },
  paystackInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.primaryLight,
    padding: 12,
    borderRadius: 10,
  },
  paystackInfoText: {
    flex: 1,
    fontSize: 13,
    color: colors.gray600,
    lineHeight: 18,
  },
  radioSelected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  radioUnselected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.gray300,
    backgroundColor: colors.white,
  },
  fieldGroup: { gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: "500", color: colors.gray700 },
  fieldInput: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  networkText: { fontSize: 14, color: colors.text },
  dropdown: {
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 2,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  dropdownLast: { borderBottomWidth: 0 },
  dropdownText: { fontSize: 14, color: colors.text },
  dropdownActive: { color: colors.primary, fontWeight: "600" },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,
  },
  successContainer: {
    flex: 1,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  successCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 32,
    width: "100%",
    alignItems: "center",
    gap: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.successLight,
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  successMessage: {
    fontSize: 15,
    color: colors.gray600,
    textAlign: "center",
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 28,
    width: "100%",
    alignItems: "center",
    gap: 14,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.warningLight,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 14,
    color: colors.gray600,
    textAlign: "center",
    lineHeight: 20,
  },
  modalActions: {
    width: "100%",
    gap: 10,
    marginTop: 4,
  },
  modalDismiss: {
    alignItems: "center",
    paddingVertical: 10,
  },
  modalDismissText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray500,
  },
});
