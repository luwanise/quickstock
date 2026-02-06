import Colors from "@/constants/Colors";
import { StyleSheet, TouchableOpacity, useColorScheme } from "react-native";
import { Text, View } from "../Themed";

interface ButtonProps {
    title: string
}

export default function Button(props: ButtonProps) {
    const colorScheme = useColorScheme();

    return (
        <TouchableOpacity style={{width: "100%"}}>
            <View
                lightColor={Colors[colorScheme ?? 'light'].tint}
                darkColor={Colors[colorScheme ?? 'dark'].tint}
                style={styles.container}>
                <Text style={{color: colorScheme === "dark" ? "black" : "white"}}>
                    {props.title}
                </Text>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderRadius: 5,
        width: "100%",
        alignItems: "center"
    }
})