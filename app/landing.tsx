import Button from "@/components/common/Button";
import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { router } from "expo-router";
import { Image, StyleSheet, useColorScheme } from "react-native";

export default function LandingPage() {
    const colorScheme = useColorScheme();

    return (
        <View style={styles.container}>
            <Image
                source={require("@/assets/images/logistics.png")}
                style={styles.image}
                resizeMode="contain"
            />
            <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].tint }]}>
                Run your inventory. Grow your business.
            </Text>
            <Text style={styles.subtitle}>
                QuickStock keeps your stock updated, organized, and ready—no spreadsheets required.
            </Text>
            <View style={styles.auth_button_container}>
                <Button
                    containerStyle={styles.auth_button}
                    title="Sign Up"
                    onPress={() => {router.push("/signup")}}
                />
                <Button
                    variant="outline"
                    containerStyle={styles.auth_button}
                    title="Log In"
                    onPress={() => {router.push("/login")}}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: "100%",
        height: 200,
        marginBottom: 20
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        textAlign: 'center',
        marginHorizontal: 20
    },
    subtitle: {
        fontSize: 16,
        marginTop: 20,
        marginHorizontal: 20,
        textAlign: 'center',
    },
    auth_button_container: {
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 20,
        gap: 20
    },
    auth_button: {
        flex: 1
    }
})