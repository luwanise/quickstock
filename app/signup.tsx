import Button from "@/components/common/Button";
import CustomTextInput from "@/components/common/CustomTextInput";
import Snackbar, { SnackBarType } from "@/components/common/Snackbar";
import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { useFormValidation } from "@/hooks/useFormValidation";
import { signUp } from "@/services/auth.service";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    useColorScheme
} from "react-native";

export default function SignupPage() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: '',
    type: 'error' as SnackBarType,
  });

  const { values, errors, touched, handleChange, handleBlur, validateForm } = useFormValidation(
    { email: '', password: '', confirmPassword: '' },
    {
      email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        custom: (value) => {
          if (!value.includes('.')) return 'Please enter a valid email address';
          return undefined;
        },
      },
      password: {
        required: true,
        minLength: 8,
        custom: (value) => {
          if (!/[A-Z]/.test(value)) {
            return 'Password must contain at least one uppercase letter';
          }
          if (!/[0-9]/.test(value)) {
            return 'Password must contain at least one number';
          }
          return undefined;
        },
      },
      confirmPassword: {
        required: true,
        custom: (value, allValues) => {
          if (value !== allValues?.password) {
            return 'Passwords do not match';
          }
          return undefined;
        },
      },
    }
  );

  const showSnackbar = (message: string, type: 'success' | 'error' | 'info' = 'error') => {
    setSnackbar({ visible: true, message, type });
  };

  const onSignUp = async () => {
    if (!validateForm()) {
      showSnackbar('Please fix the errors in the form');
      return;
    }
    
    setIsLoading(true);
    const result = await signUp(values.email, values.password);
    setIsLoading(false);
    
    if (result.error) {
      showSnackbar(result.error.message);
      return;
    }

    showSnackbar('Account created successfully!', 'success');
    setTimeout(() => {
      router.push("/(tabs)");
    }, 1500);
  };

  const passwordStrength = () => {
    const strength = {
      score: 0,
      label: 'Weak',
      color: theme.danger,
    };

    if (values.password.length >= 8) strength.score++;
    if (/[A-Z]/.test(values.password)) strength.score++;
    if (/[0-9]/.test(values.password)) strength.score++;
    if (/[^A-Za-z0-9]/.test(values.password)) strength.score++;

    if (strength.score >= 3) {
      strength.label = 'Strong';
      strength.color = theme.success;
    } else if (strength.score >= 2) {
      strength.label = 'Medium';
      strength.color = theme.warning;
    }

    return strength;
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.tint }]}>
            Create Account
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Join us to start managing your inventory
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              EMAIL ADDRESS
            </Text>
            <CustomTextInput
              placeholder="Enter your email"
              value={values.email}
              onChangeText={(text) => handleChange('email', text)}
              onBlur={() => handleBlur('email')}
              inputMode="email"
              iconName="email"
              error={errors.email}
              touched={touched.email}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              PASSWORD
            </Text>
            <CustomTextInput
              placeholder="Create a password"
              value={values.password}
              onChangeText={(text) => handleChange('password', text)}
              onBlur={() => handleBlur('password')}
              secureTextEntry
              iconName="lock"
              error={errors.password}
              touched={touched.password}
            />
            {values.password.length > 0 && !errors.password && (
              <View style={styles.strengthContainer}>
                <View style={[styles.strengthBar, { backgroundColor: theme.progressBackground }]}>
                  <View 
                    style={[
                      styles.strengthFill, 
                      { 
                        backgroundColor: passwordStrength().color,
                        width: `${(passwordStrength().score / 4) * 100}%` 
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.strengthText, { color: passwordStrength().color }]}>
                  {passwordStrength().label} password
                </Text>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              CONFIRM PASSWORD
            </Text>
            <CustomTextInput
              placeholder="Confirm your password"
              value={values.confirmPassword}
              onChangeText={(text) => handleChange('confirmPassword', text)}
              onBlur={() => handleBlur('confirmPassword')}
              secureTextEntry
              iconName="lock-check"
              error={errors.confirmPassword}
              touched={touched.confirmPassword}
            />
          </View>

          <Button
            title="SIGN UP"
            onPress={onSignUp}
            variant="primary"
            iconName="account-plus"
            fullWidth
            loading={isLoading}
            disabled={isLoading}
            containerStyle={styles.signupButton}
          />

          <View style={styles.dividerContainer}>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <Text style={[styles.dividerText, { color: theme.textSecondary }]}>
              OR
            </Text>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
          </View>

          <Button
            title="SIGN UP WITH GOOGLE"
            variant="outline"
            iconName="google"
            fullWidth
            onPress={() => showSnackbar('Google sign up coming soon!', 'info')}
            containerStyle={styles.googleButton}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            Already have an account?{' '}
          </Text>
          <Link href="/login" asChild>
            <TouchableOpacity>
              <Text style={[styles.footerLink, { color: theme.tint }]}>
                Log In
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>

      <Snackbar
        visible={snackbar.visible}
        message={snackbar.message}
        type={snackbar.type}
        onDismiss={() => setSnackbar(prev => ({ ...prev, visible: false }))}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 30,
  },
  header: {
    marginBottom: 40,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  form: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  inputGroup: {
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  signupButton: {
    marginTop: 8,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    backgroundColor: 'transparent',
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  googleButton: {
    marginBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: 'transparent',
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
  },
  strengthContainer: {
    marginTop: 8,
    backgroundColor: 'transparent',
  },
  strengthBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});