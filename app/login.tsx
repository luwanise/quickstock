import Button from "@/components/common/Button";
import CustomTextInput from "@/components/common/CustomTextInput";
import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { login } from "@/services/auth.service";
import { Link, router } from "expo-router";
import { useState } from "react";
import { StyleSheet, useColorScheme } from "react-native";

export default function LoginPage() {
    const colorScheme = useColorScheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const onLogin = async () => {
        setIsLoading(true);
        const result = await login(email, password);
        setIsLoading(false);
        
        if (result.error) {
            alert(result.error.message);
            return;
        }

        console.log("User:",result.data.user);
        router.push("/(tabs)");
    }

    return (
        <View
            lightColor={Colors[colorScheme ?? 'light'].background}
            darkColor={Colors[colorScheme ?? 'dark'].background}
            style={styles.container}
        >
            <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].tint }]}>WELCOME BACK!</Text>
            <View style={styles.form}>
                <Text style={styles.textInputHeader}>EMAIL</Text>
                <CustomTextInput
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    inputMode="email"
                />
                <Text style={styles.textInputHeader}>PASSWORD</Text>
                <CustomTextInput
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                <Text style={[styles.forgotPassword, { color: Colors[colorScheme ?? 'light'].tint }]}>
                    FORGOT YOUR PASSWORD?
                </Text>
                <Button
                    containerStyle={styles.loginButton}
                    title={isLoading ? "LOADING..." : "LOG IN"}
                    onPress={onLogin}
                    disabled={isLoading}
                />
                <Link
                    href="/signup"
                    style={[styles.createAccount, { color: Colors[colorScheme ?? 'light'].tint }]}
                    replace
                >
                    CREATE NEW ACCOUNT
                </Link>
            </View>
            <View style={styles.continueWith}>
                <Text>OR CONTINUE WITH</Text>
                <Button
                    containerStyle={styles.googleLogin}
                    title="GOOGLE"
                    iconName="google"
                    onPress={() => {}}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    form: {
        width: "100%"
    },
    textInputHeader: {
        marginBottom: 16,
        fontWeight: "500"
    },
    forgotPassword: {
        textAlign: "right",
        fontWeight: "500",
    },
    loginButton: {
        width: "100%",
        marginTop: 20
    },
    createAccount: {
        textAlign: "center",
        fontWeight: "500",
        marginTop: 20
    },
    continueWith: {
        alignItems: "center",
        width: "100%"
    },
    googleLogin: {
        width: "100%",
        marginTop: 20,
        marginBottom: 40
    }
});