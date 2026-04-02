import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Modal,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import CustomButton from "../components/CustomButton";
import { colors } from "../theme/colors";
import { getVendorMenuAPI, getLocationsAPI } from "services/services";
import { MenuItem } from "models/vendors";
import { Location } from "models/location";

type NavigationProp = NativeStackNavigationProp<any>;
type RouteType = RouteProp<{ MenuOrder: { vendor: any } }, "MenuOrder">;
const LIVE_REFRESH_INTERVAL_MS = 5000;

export default function MenuOrderScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const insets = useSafeAreaInsets();
  const vendor = route.params?.vendor || { name: "Akornor" };

  const [cart, setCart] = useState<{ [key: number]: number }>({});
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [showError, setShowError] = useState(false);
  const [menuItems, setMenus] = useState<MenuItem[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const fetchMenu = async () => {
    try {
      const data = await getVendorMenuAPI(vendor.id);
      setMenus(data || []);
    } catch (error) {
      console.error("Failed to fetch menus:", error);
      setMenus([]);
    }
  };

  const fetchLocations = async () => {
    try {
      const data = await getLocationsAPI();
      setLocations(data || []);
    } catch (error) {
      console.error("Failed to fetch locations:", error);
      setLocations([]);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      void fetchMenu();
      void fetchLocations();

      const interval = setInterval(() => {
        void fetchMenu();
        void fetchLocations();
      }, LIVE_REFRESH_INTERVAL_MS);

      return () => clearInterval(interval);
    }, [vendor.id]),
  );

  const addToCart = (id: number) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => {
      const next = { ...prev };
      if (next[id] > 1) {
        next[id]--;
      } else {
        delete next[id];
      }
      return next;
    });
  };

  const totalItems = Object.values(cart).reduce((s, q) => s + q, 0);
  const totalPrice = menuItems.reduce(
    (s, i: any) => s + (cart[i.id!] || 0) * i.price,
    0,
  );

  const handlePlaceOrder = () => {
    if (!deliveryLocation.trim()) {
      setShowError(true);
      return;
    }
    const cartItems = menuItems
      .filter((i: any) => cart[i.id] > 0)
      .map((i: any) => ({
        name: i.name,
        quantity: cart[i.id],
        price: i.price,
      }));

    navigation.navigate("Checkout", { vendor, deliveryLocation, cartItems });
  };

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
        <Text style={styles.headerTitle}>{vendor.name}</Text>
        <Text style={styles.headerSubtitle}>
          Browse menu and place your order
        </Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={{ paddingBottom: totalItems > 0 ? 120 : 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Delivery Location */}
        <View style={styles.locationCard}>
          <Text style={styles.sectionLabel}>Delivery Location</Text>
          <TouchableOpacity
            style={[styles.inputWrapper, showError && styles.inputError]}
            onPress={() => setShowLocationPicker(true)}
            activeOpacity={0.7}
          >
            <Ionicons
              name="location-outline"
              size={20}
              color={colors.gray400}
              style={styles.inputIcon}
            />
            <Text
              style={[
                styles.input,
                !deliveryLocation && { color: colors.gray400 },
              ]}
            >
              {deliveryLocation || "Select a delivery location"}
            </Text>
            <Ionicons
              name="chevron-down"
              size={18}
              color={colors.gray400}
              style={{ paddingRight: 12 }}
            />
          </TouchableOpacity>
          {showError && (
            <Text style={styles.errorText}>
              Please select a delivery location
            </Text>
          )}
        </View>

        {/* Location Picker Modal */}
        <Modal
          visible={showLocationPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowLocationPicker(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowLocationPicker(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Location</Text>
                <TouchableOpacity onPress={() => setShowLocationPicker(false)}>
                  <Ionicons name="close" size={24} color={colors.gray700} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={locations}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.locationOption,
                      deliveryLocation === item.name &&
                        styles.locationOptionActive,
                    ]}
                    onPress={() => {
                      setDeliveryLocation(item.name);
                      setShowError(false);
                      setShowLocationPicker(false);
                    }}
                  >
                    <Ionicons
                      name="location-outline"
                      size={18}
                      color={
                        deliveryLocation === item.name
                          ? colors.primary
                          : colors.gray500
                      }
                    />
                    <Text
                      style={[
                        styles.locationOptionText,
                        deliveryLocation === item.name &&
                          styles.locationOptionTextActive,
                      ]}
                    >
                      {item.name}
                    </Text>
                    {deliveryLocation === item.name && (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No locations available</Text>
                }
              />
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Menu */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Menu</Text>
          {menuItems.map((item) => {
            if (item.id == null) {
              return null;
            }

            const itemId = item.id;

            return (
              <View key={itemId} style={styles.menuCard}>
                <Image
                  source={{ uri: item.image_url }}
                  style={styles.menuImage}
                  resizeMode="cover"
                />
                <View style={styles.menuInfo}>
                  <Text style={styles.menuName}>{item.name}</Text>
                  <Text style={styles.menuDesc} numberOfLines={2}>
                    {item.description}
                  </Text>
                  <View style={styles.menuBottom}>
                    <Text style={styles.menuPrice}>GH₵{item.price}</Text>
                    {cart[itemId] ? (
                      <View style={styles.qtyControl}>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() => removeFromCart(itemId)}
                        >
                          <Ionicons
                            name="remove"
                            size={16}
                            color={colors.primary}
                          />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{cart[itemId]}</Text>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() => addToCart(itemId)}
                        >
                          <Ionicons name="add" size={16} color={colors.primary} />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.addBtn}
                        onPress={() => addToCart(itemId)}
                      >
                        <Text style={styles.addBtnText}>Add to Cart</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Fixed Bottom Cart Summary */}
      {totalItems > 0 && (
        <View style={[styles.cartBar, { paddingBottom: insets.bottom + 8 }]}>
          <View style={styles.cartInfo}>
            <View style={styles.cartInfoRow}>
              <Ionicons name="cart-outline" size={20} color={colors.primary} />
              <Text style={styles.cartItemCount}>{totalItems} items</Text>
            </View>
            <Text style={styles.cartTotal}>GH₵{totalPrice}</Text>
          </View>
          <CustomButton onPress={handlePlaceOrder} fullWidth>
            Place Order
          </CustomButton>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backBtn: {
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  locationCard: {
    margin: 16,
    marginTop: -12,
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray700,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 10,
  },
  inputError: {
    borderColor: colors.danger,
  },
  inputIcon: {
    paddingLeft: 12,
    paddingRight: 4,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 12,
    fontSize: 15,
    color: colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "60%",
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.text,
  },
  locationOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray100,
  },
  locationOptionActive: {
    backgroundColor: "rgba(34,139,34,0.06)",
  },
  locationOptionText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  locationOptionTextActive: {
    fontWeight: "600",
    color: colors.primary,
  },
  emptyText: {
    textAlign: "center",
    paddingVertical: 24,
    fontSize: 14,
    color: colors.gray400,
  },
  errorText: {
    fontSize: 13,
    color: colors.danger,
  },
  menuSection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
  },
  menuCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    flexDirection: "row",
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  menuImage: {
    width: 96,
    height: 96,
  },
  menuInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  menuName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  menuDesc: {
    fontSize: 12,
    color: colors.gray500,
    marginTop: 2,
  },
  menuBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  menuPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary,
  },
  qtyControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.gray100,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 4,
    gap: 4,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    minWidth: 20,
    textAlign: "center",
  },
  addBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.white,
  },
  cartBar: {
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
    gap: 10,
  },
  cartInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cartInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cartItemCount: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  cartTotal: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
  },
});
