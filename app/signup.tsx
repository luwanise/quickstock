import Button from "@/components/common/Button";
import CustomTextInput from "@/components/common/CustomTextInput";
import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { Link, router } from "expo-router";
import { useState } from "react";
import { StyleSheet, useColorScheme } from "react-native";

export default function SignupPage() {
    const colorScheme = useColorScheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    return (
        <View
            lightColor={Colors[colorScheme ?? 'light'].background}
            darkColor={Colors[colorScheme ?? 'dark'].background}
            style={styles.container}
        >
            <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].tint }]}>
                READY FOR A NEW JOURNEY?
            </Text>
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
                <Text style={styles.textInputHeader}>CONFIRM PASSWORD</Text>
                <CustomTextInput
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                />
                <Button
                    containerStyle={styles.signupButton}
                    title="SIGN UP"
                    onPress={() => {router.push("/(tabs)")}}
                />
                <Link
                    href="/login"
                    style={[styles.haveAnAccount, { color: Colors[colorScheme ?? 'light'].tint }]}
                    replace
                >
                    ALREADY HAVE AN ACCOUNT?
                </Link>
            </View>
            <View style={styles.continueWith}>
                <Text>OR SIGN UP WITH</Text>
                <Button
                    containerStyle={styles.googleSignup}
                    title="GOOGLE"
                    iconName="google"
                    onPress={() => {router.push("/(tabs)")}}
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
    signupButton: {
        width: "100%",
        marginTop: 20
    },
    haveAnAccount: {
        textAlign: "center",
        fontWeight: "500",
        marginTop: 20
    },
    continueWith: {
        alignItems: "center",
        width: "100%"
    },
    googleSignup: {
        width: "100%",
        marginTop: 20,
        marginBottom: 40
    }
});