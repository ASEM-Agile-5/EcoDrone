import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CustomButton from '../components/CustomButton';
import { colors } from '../theme/colors';

type NavigationProp = NativeStackNavigationProp<any>;
type RouteType = RouteProp<{ MenuOrder: { vendor: any } }, 'MenuOrder'>;

const menuItems = [
  {
    id: 1,
    name: 'Jollof Rice with Chicken',
    price: 25,
    description: 'Signature West African rice with grilled chicken',
    imageUrl:
      'https://images.unsplash.com/photo-1665332195309-9d75071138f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqb2xsb2YlMjByaWNlJTIwYWZyaWNhbiUyMGZvb2R8ZW58MXx8fHwxNzcwNzc0MjEyfDA&ixlib=rb-4.1.0&q=80&w=400',
  },
  {
    id: 2,
    name: 'Waakye Combo',
    price: 20,
    description: 'Rice and beans with spaghetti and plantain',
    imageUrl:
      'https://images.unsplash.com/photo-1650815232474-12d5b9375d63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YWFreWUlMjBnaGFuYSUyMGZvb2R8ZW58MXx8fHwxNzcwODI3NzUzfDA&ixlib=rb-4.1.0&q=80&w=400',
  },
  {
    id: 3,
    name: 'Grilled Chicken & Fries',
    price: 30,
    description: 'Marinated grilled chicken with crispy fries',
    imageUrl:
      'https://images.unsplash.com/photo-1682423187670-4817da9a1b23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmlsbGVkJTIwY2hpY2tlbiUyMG1lYWx8ZW58MXx8fHwxNzcwODI1NTI4fDA&ixlib=rb-4.1.0&q=80&w=400',
  },
  {
    id: 4,
    name: 'Fried Rice Special',
    price: 22,
    description: 'Asian-style fried rice with vegetables',
    imageUrl:
      'https://images.unsplash.com/photo-1687020835955-59528e8c91dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmllZCUyMHJpY2UlMjBwbGF0ZXxlbnwxfHx8fDE3NzA3MDQ0MDV8MA&ixlib=rb-4.1.0&q=80&w=400',
  },
];

export default function MenuOrderScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const insets = useSafeAreaInsets();
  const vendor = route.params?.vendor || { name: 'Akornor' };

  const [cart, setCart] = useState<{ [key: number]: number }>({});
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [showError, setShowError] = useState(false);

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
  const totalPrice = menuItems.reduce((s, i) => s + (cart[i.id] || 0) * i.price, 0);

  const handlePlaceOrder = () => {
    if (!deliveryLocation.trim()) {
      setShowError(true);
      return;
    }
    const cartItems = menuItems
      .filter((i) => cart[i.id] > 0)
      .map((i) => ({ name: i.name, quantity: cart[i.id], price: i.price }));

    navigation.navigate('Checkout', { vendor, deliveryLocation, cartItems });
  };

  return (
    <View style={styles.flex}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{vendor.name}</Text>
        <Text style={styles.headerSubtitle}>Browse menu and place your order</Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={{ paddingBottom: totalItems > 0 ? 120 : 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Delivery Location */}
        <View style={styles.locationCard}>
          <Text style={styles.sectionLabel}>Delivery Location</Text>
          <View style={[styles.inputWrapper, showError && styles.inputError]}>
            <Ionicons name="location-outline" size={20} color={colors.gray400} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={deliveryLocation}
              onChangeText={(v) => {
                setDeliveryLocation(v);
                setShowError(false);
              }}
              placeholder="e.g., CS Lab, Block 7"
              placeholderTextColor={colors.gray400}
            />
          </View>
          {showError && (
            <Text style={styles.errorText}>Please enter a delivery location</Text>
          )}
        </View>

        {/* Menu */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Menu</Text>
          {menuItems.map((item) => (
            <View key={item.id} style={styles.menuCard}>
              <Image source={{ uri: item.imageUrl }} style={styles.menuImage} resizeMode="cover" />
              <View style={styles.menuInfo}>
                <Text style={styles.menuName}>{item.name}</Text>
                <Text style={styles.menuDesc} numberOfLines={2}>{item.description}</Text>
                <View style={styles.menuBottom}>
                  <Text style={styles.menuPrice}>GH₵{item.price}</Text>
                  {cart[item.id] ? (
                    <View style={styles.qtyControl}>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => removeFromCart(item.id)}
                      >
                        <Ionicons name="remove" size={16} color={colors.primary} />
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{cart[item.id]}</Text>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => addToCart(item.id)}
                      >
                        <Ionicons name="add" size={16} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.addBtn}
                      onPress={() => addToCart(item.id)}
                    >
                      <Text style={styles.addBtnText}>Add to Cart</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))}
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
    fontWeight: '700',
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
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
    fontWeight: '500',
    color: colors.gray700,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
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
  errorText: {
    fontSize: 13,
    color: colors.danger,
  },
  menuSection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  menuCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    flexDirection: 'row',
    overflow: 'hidden',
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
    justifyContent: 'space-between',
  },
  menuName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  menuDesc: {
    fontSize: 12,
    color: colors.gray500,
    marginTop: 2,
  },
  menuBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  menuPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 4,
    gap: 4,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    minWidth: 20,
    textAlign: 'center',
  },
  addBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
  },
  cartBar: {
    position: 'absolute',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cartItemCount: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  cartTotal: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
});
