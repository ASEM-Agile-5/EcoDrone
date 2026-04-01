import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import CustomButton from "../components/CustomButton";
import { colors } from "../theme/colors";
import { loginAPI } from "services/services";
import { LoginResponse } from "models/users";
import { useUser } from "../context/UserContext";

type NavigationProp = NativeStackNavigationProp<any>;

const { height } = Dimensions.get("window");

const DRONE_IMAGE =
  "https://images.unsplash.com/photo-1753781466620-d2bc4d703b2e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWxpdmVyeSUyMGRyb25lJTIwZmx5aW5nfGVufDF8fHx8MTc3MDgzMDA0MHww&ixlib=rb-4.1.0&q=80&w=1080";

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { completeLogin } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (!password) {
      errors.password = "Password is required.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    setError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const response: any = await loginAPI(email, password);

      if (!response) {
        throw new Error("Login failed");
      }
      if (response.status === 401) {
        setError("Incorrect email or password. Please try again.");
        return;
      }

      const data = response.data;

      if (data?.non_field_errors && data.non_field_errors.length > 0) {
        setError(data.non_field_errors.join(", "));
        return;
      }

      const loginData: LoginResponse = data;
      const token = loginData.token;
      const user_id = loginData.user_id;

      if (token && user_id) {
        await completeLogin(String(user_id));
        navigation.reset({ index: 0, routes: [{ name: "Main" }] });
      }
    } catch (error: any) {
      console.error(error);

      const errData = error?.response?.data;
      if (errData?.non_field_errors && errData.non_field_errors.length > 0) {
        setError(errData.non_field_errors.join(", "));
        return;
      }
      if (errData?.detail) {
        setError(errData.detail);
        return;
      }

      setError("Incorrect email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.flex}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: DRONE_IMAGE }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>EcoDrone</Text>
            <Text style={styles.heroSubtitle}>Ashesi University Delivery</Text>
          </View>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Ashesi Email</Text>
            <View style={[styles.inputWrapper, fieldErrors.email ? styles.inputError : null]}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={fieldErrors.email ? colors.danger : colors.gray400}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={(v) => { setEmail(v); setFieldErrors((e) => ({ ...e, email: undefined })); }}
                placeholder="student@ashesi.edu.gh"
                placeholderTextColor={colors.gray400}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {fieldErrors.email ? <Text style={styles.fieldError}>{fieldErrors.email}</Text> : null}
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={[styles.inputWrapper, fieldErrors.password ? styles.inputError : null]}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={fieldErrors.password ? colors.danger : colors.gray400}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, styles.inputWithRight]}
                value={password}
                onChangeText={(v) => { setPassword(v); setFieldErrors((e) => ({ ...e, password: undefined })); }}
                placeholder="Enter your password"
                placeholderTextColor={colors.gray400}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={colors.gray400}
                />
              </TouchableOpacity>
            </View>
            {fieldErrors.password ? <Text style={styles.fieldError}>{fieldErrors.password}</Text> : null}
          </View>

          {/* Remember me + Forgot password */}
          <View style={styles.rowBetween}>
            <TouchableOpacity
              style={styles.rememberRow}
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
            >
              <View
                style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
              >
                {rememberMe && (
                  <Ionicons name="checkmark" size={12} color={colors.white} />
                )}
              </View>
              <Text style={styles.rememberText}>Remember me</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

          <CustomButton onPress={handleLogin} fullWidth loading={loading} disabled={loading}>
            Sign In
          </CustomButton>

          <View style={styles.signupRow}>
            <Text style={styles.signupPrompt}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
              <Text style={styles.signupLink}>Create Account</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>© An Agile5 Product</Text>
            <Text style={styles.footerText}>Sustainable campus delivery</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.white,
  },
  heroContainer: {
    height: height * 0.42,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(138,21,56,0.72)",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 28,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: "700",
    color: colors.white,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.9)",
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 32,
    gap: 20,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
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
    backgroundColor: colors.white,
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
    paddingVertical: 14,
    paddingRight: 12,
    fontSize: 15,
    color: colors.text,
  },
  inputWithRight: {
    paddingRight: 4,
  },
  eyeIcon: {
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.gray300,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  rememberText: {
    fontSize: 14,
    color: colors.gray600,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.primary,
  },
  fieldError: {
    fontSize: 12,
    color: colors.danger,
  },
  errorBanner: {
    fontSize: 14,
    color: colors.danger,
    textAlign: "center",
    backgroundColor: "#fef2f2",
    borderRadius: 8,
    padding: 10,
  },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupPrompt: {
    fontSize: 14,
    color: colors.gray600,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  footer: {
    alignItems: "center",
    marginTop: 8,
    gap: 2,
  },
  footerText: {
    fontSize: 11,
    color: colors.gray400,
  },
});
