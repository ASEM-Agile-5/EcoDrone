import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useUser } from "../context/UserContext";
import { colors } from "../theme/colors";
import { clearAuthToken } from "services/services";

type NavigationProp = NativeStackNavigationProp<any>;

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  iconColor: string;
  iconBg: string;
}

const menuItems: MenuItem[] = [
  {
    icon: "person-outline",
    label: "Personal Information",
    iconColor: colors.info,
    iconBg: colors.infoLight,
  },
  {
    icon: "location-outline",
    label: "Saved Addresses",
    iconColor: colors.success,
    iconBg: colors.successLight,
  },
  {
    icon: "card-outline",
    label: "Payment Methods",
    iconColor: "#7c3aed",
    iconBg: "#ede9fe",
  },
  {
    icon: "notifications-outline",
    label: "Notifications",
    iconColor: colors.warning,
    iconBg: colors.warningLight,
  },
  {
    icon: "help-circle-outline",
    label: "Help & Support",
    iconColor: "#4338ca",
    iconBg: "#e0e7ff",
  },
];

export default function ProfileScreen() {
  const { user, loading, refetchUser } = useUser();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    refetchUser();
  }, []);

  // useEffect(() => {
  //   if (!loading && !user) {
  //     navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  //   }
  // }, [loading, user]);

  const handleLogout = async () => {
    await clearAuthToken();
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  return (
    <View style={styles.flex}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>Profile</Text>

        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={32} color={colors.primary} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user ? `${user.first_name} ${user.last_name}` : "..."}
            </Text>
            <Text style={styles.userEmail}>{user?.email || "..."}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index < menuItems.length - 1 && styles.menuItemBorder,
              ]}
              activeOpacity={0.7}
            >
              <View
                style={[styles.menuIconBox, { backgroundColor: item.iconBg }]}
              >
                <Ionicons name={item.icon} size={20} color={item.iconColor} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.gray400}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Contact Info */}
        <View style={styles.contactCard}>
          <Text style={styles.cardTitle}>Contact Information</Text>
          <View style={styles.contactRow}>
            <Ionicons name="mail-outline" size={18} color={colors.gray400} />
            <Text style={styles.contactText}>{user?.email || "—"}</Text>
          </View>
          <View style={styles.contactRow}>
            <Ionicons name="call-outline" size={18} color={colors.gray400} />
            <Text style={styles.contactText}>+233 24 123 4567</Text>
          </View>
          <View style={styles.contactRow}>
            <Ionicons
              name="location-outline"
              size={18}
              color={colors.gray400}
            />
            <Text style={styles.contactText}>Ashesi University Campus</Text>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 16,
  },
  headerTitle: { fontSize: 22, fontWeight: "700", color: colors.white },
  userCard: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 17, fontWeight: "600", color: colors.white },
  userEmail: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  content: { padding: 16, gap: 14 },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statItem: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  statValue: { fontSize: 22, fontWeight: "700", color: colors.primary },
  statLabel: { fontSize: 11, color: colors.gray500, marginTop: 2 },
  menuCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: "500", color: colors.text },
  contactCard: {
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
  cardTitle: { fontSize: 14, fontWeight: "600", color: colors.text },
  contactRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  contactText: { fontSize: 13, color: colors.gray700 },
  logoutBtn: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  logoutText: { fontSize: 15, fontWeight: "500", color: colors.danger },
});
