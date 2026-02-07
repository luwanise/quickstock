import { getVariantStyles, Variant } from "@/utils/getVariantStyles";
import { StyleProp, StyleSheet, TextStyle, TouchableOpacity, useColorScheme, ViewStyle } from "react-native";
import { Text, View } from "../Themed";

interface ButtonProps {
    title: string;
    onPress?: () => void;
    variant?: Variant;
    containerStyle?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
}

export default function Button(
    {
        title,
        onPress,
        variant = "primary",
        containerStyle,
        textStyle
    }: ButtonProps
) {
    const colorScheme = useColorScheme();
    const buttonStyles = getVariantStyles(variant, colorScheme);

    return (
        <TouchableOpacity style={containerStyle} onPress={onPress}>
            <View style={[styles.container, buttonStyles.container]}>
                <Text style={[buttonStyles.text, textStyle]}>{title}</Text>
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