import Button from "@/components/common/Button";
import CustomTextInput from "@/components/common/CustomTextInput";
import Snackbar, { SnackBarType } from "@/components/common/Snackbar";
import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { useFormValidation } from "@/hooks/useFormValidation";
import { login } from "@/services/auth.service";
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

export default function LoginPage() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: '',
    type: 'error' as SnackBarType,
  });

  const { values, errors, touched, handleChange, handleBlur, validateForm } = useFormValidation(
    { email: '', password: '' },
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
        minLength: 6,
      },
    }
  );

  const showSnackbar = (message: string, type: 'success' | 'error' | 'info' = 'error') => {
    setSnackbar({ visible: true, message, type });
  };

  const onLogin = async () => {
    if (!validateForm()) {
      showSnackbar('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);
    const result = await login(values.email, values.password);
    setIsLoading(false);
    
    if (result.error) {
      showSnackbar(result.error.message);
      return;
    }

    showSnackbar('Login successful!', 'success');
    setTimeout(() => {
      router.push("/(tabs)");
    }, 1000);
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
            Welcome Back
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Sign in to continue managing your inventory
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
              placeholder="Enter your password"
              value={values.password}
              onChangeText={(text) => handleChange('password', text)}
              onBlur={() => handleBlur('password')}
              secureTextEntry
              iconName="lock"
              error={errors.password}
              touched={touched.password}
            />
          </View>

          <TouchableOpacity 
            style={styles.forgotPasswordContainer}
            onPress={() => showSnackbar('Password reset feature coming soon!', 'info')}
          >
            <Text style={[styles.forgotPassword, { color: theme.tint }]}>
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <Button
            title="LOG IN"
            onPress={onLogin}
            variant="primary"
            iconName="login"
            fullWidth
            loading={isLoading}
            disabled={isLoading}
            containerStyle={styles.loginButton}
          />

          <View style={styles.dividerContainer}>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <Text style={[styles.dividerText, { color: theme.textSecondary }]}>
              OR
            </Text>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
          </View>

          <Button
            title="CONTINUE WITH GOOGLE"
            variant="outline"
            iconName="google"
            fullWidth
            onPress={() => showSnackbar('Google sign in coming soon!', 'info')}
            containerStyle={styles.googleButton}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            Don't have an account?{' '}
          </Text>
          <Link href="/signup" asChild>
            <TouchableOpacity>
              <Text style={[styles.footerLink, { color: theme.tint }]}>
                Sign Up
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
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotPassword: {
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
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
});