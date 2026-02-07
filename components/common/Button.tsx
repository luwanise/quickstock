import Colors from "@/constants/Colors";
import { getVariantStyles, Variant } from "@/utils/getVariantStyles";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { StyleProp, StyleSheet, TextStyle, TouchableOpacity, useColorScheme, ViewStyle } from "react-native";
import { Text, View } from "../Themed";

interface ButtonProps {
    title: string;
    onPress?: () => void;
    variant?: Variant;
    containerStyle?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    iconName?: ComponentProps<typeof MaterialCommunityIcons>['name'];
}

export default function Button(
    {
        title,
        onPress,
        variant = "primary",
        containerStyle,
        textStyle,
        iconName,
    }: ButtonProps
) {
    const colorScheme = useColorScheme();
    const buttonStyles = getVariantStyles(variant, colorScheme);

    return (
        <TouchableOpacity activeOpacity={0.7} style={containerStyle} onPress={onPress}>
            <View style={[styles.container, buttonStyles.container]}>
                {iconName && (
                    <MaterialCommunityIcons
                        name={iconName}
                        size={20}
                        color={Colors[colorScheme ?? 'light'].tintText}
                    />
                )}
                <Text style={[buttonStyles.text, textStyle]}>{title}</Text>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "center",
        padding: 16,
        borderRadius: 5,
        width: "100%",
        alignItems: "center",
        gap: 10
    }
})