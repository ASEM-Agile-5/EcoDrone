import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CustomButton from '../components/CustomButton';
import { colors } from '../theme/colors';
import { signUpAPI } from 'services/services';

type NavigationProp = NativeStackNavigationProp<any>;

export default function SignUpScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required.';
    } else if (formData.fullName.trim().split(' ').length < 2) {
      errors.fullName = 'Please enter your first and last name.';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required.';
    }

    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (!agreed) {
      errors.terms = 'You must accept the Terms & Conditions.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignUp = async () => {
    setError('');
    if (!validate()) return;

    const nameParts = formData.fullName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');
    const username = formData.email.split('@')[0];

    setLoading(true);
    try {
      await signUpAPI({
        email: formData.email,
        password: formData.password,
        password_confirm: formData.confirmPassword,
        first_name: firstName,
        last_name: lastName,
        username,
        terms_accepted: agreed,
      });
      navigation.navigate('Login');
    } catch (err: any) {
      const errData = err?.response?.data;
      if (errData) {
        // Map backend field errors to friendly messages
        const messages: string[] = [];
        Object.entries(errData).forEach(([key, val]) => {
          const msg = Array.isArray(val) ? val.join(', ') : String(val);
          if (key === 'email') setFieldErrors((p) => ({ ...p, email: msg }));
          else if (key === 'password') setFieldErrors((p) => ({ ...p, password: msg }));
          else messages.push(msg);
        });
        if (messages.length > 0) setError(messages.join(' '));
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Account</Text>
        <Text style={styles.headerSubtitle}>Join EcoDrone for fast campus delivery</Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.formContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Full Name */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Full Name</Text>
          <View style={[styles.inputWrapper, fieldErrors.fullName ? styles.inputError : null]}>
            <Ionicons name="person-outline" size={20} color={fieldErrors.fullName ? colors.danger : colors.gray400} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.fullName}
              onChangeText={(v) => handleChange('fullName', v)}
              placeholder="John Doe"
              placeholderTextColor={colors.gray400}
            />
          </View>
          {fieldErrors.fullName ? <Text style={styles.fieldError}>{fieldErrors.fullName}</Text> : null}
        </View>

        {/* Email */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Ashesi Email</Text>
          <View style={[styles.inputWrapper, fieldErrors.email ? styles.inputError : null]}>
            <Ionicons name="mail-outline" size={20} color={fieldErrors.email ? colors.danger : colors.gray400} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(v) => handleChange('email', v)}
              placeholder="student@ashesi.edu.gh"
              placeholderTextColor={colors.gray400}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          {fieldErrors.email ? <Text style={styles.fieldError}>{fieldErrors.email}</Text> : null}
        </View>

        {/* Phone */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <View style={[styles.inputWrapper, fieldErrors.phone ? styles.inputError : null]}>
            <Ionicons name="call-outline" size={20} color={fieldErrors.phone ? colors.danger : colors.gray400} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(v) => handleChange('phone', v)}
              placeholder="024 123 4567"
              placeholderTextColor={colors.gray400}
              keyboardType="phone-pad"
            />
          </View>
          {fieldErrors.phone ? <Text style={styles.fieldError}>{fieldErrors.phone}</Text> : null}
        </View>

        {/* Password */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={[styles.inputWrapper, fieldErrors.password ? styles.inputError : null]}>
            <Ionicons name="lock-closed-outline" size={20} color={fieldErrors.password ? colors.danger : colors.gray400} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.inputWithRight]}
              value={formData.password}
              onChangeText={(v) => handleChange('password', v)}
              placeholder="Create a password"
              placeholderTextColor={colors.gray400}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.gray400} />
            </TouchableOpacity>
          </View>
          {fieldErrors.password ? <Text style={styles.fieldError}>{fieldErrors.password}</Text> : null}
        </View>

        {/* Confirm Password */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={[styles.inputWrapper, fieldErrors.confirmPassword ? styles.inputError : null]}>
            <Ionicons name="lock-closed-outline" size={20} color={fieldErrors.confirmPassword ? colors.danger : colors.gray400} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.inputWithRight]}
              value={formData.confirmPassword}
              onChangeText={(v) => handleChange('confirmPassword', v)}
              placeholder="Confirm your password"
              placeholderTextColor={colors.gray400}
              secureTextEntry={!showConfirm}
            />
            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeIcon}>
              <Ionicons name={showConfirm ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.gray400} />
            </TouchableOpacity>
          </View>
          {fieldErrors.confirmPassword ? <Text style={styles.fieldError}>{fieldErrors.confirmPassword}</Text> : null}
        </View>

        {/* Terms */}
        <View>
          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => { setAgreed(!agreed); setFieldErrors((p) => ({ ...p, terms: '' })); }}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, agreed && styles.checkboxChecked, fieldErrors.terms ? styles.checkboxError : null]}>
              {agreed && <Ionicons name="checkmark" size={12} color={colors.white} />}
            </View>
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text style={styles.termsLink}>Terms & Conditions</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>
          {fieldErrors.terms ? <Text style={[styles.fieldError, { marginTop: 4 }]}>{fieldErrors.terms}</Text> : null}
        </View>

        {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

        <CustomButton onPress={handleSignUp} fullWidth loading={loading} disabled={loading}>
          Create Account
        </CustomButton>

        <View style={styles.loginRow}>
          <Text style={styles.loginPrompt}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 Ashesi University</Text>
          <Text style={styles.footerText}>Sustainable campus food delivery</Text>
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
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  backBtn: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 18,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
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
  fieldError: {
    fontSize: 12,
    color: colors.danger,
  },
  errorBanner: {
    fontSize: 14,
    color: colors.danger,
    textAlign: 'center',
    backgroundColor: colors.dangerLight,
    borderRadius: 8,
    padding: 10,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.gray300,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxError: {
    borderColor: colors.danger,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: colors.gray600,
    lineHeight: 20,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: '500',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginPrompt: {
    fontSize: 14,
    color: colors.gray600,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  footer: {
    alignItems: 'center',
    gap: 2,
  },
  footerText: {
    fontSize: 11,
    color: colors.gray400,
  },
});
