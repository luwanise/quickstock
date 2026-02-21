import Colors from "@/constants/Colors";
import { getVariantStyles, Variant } from "@/utils/getVariantStyles";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import {
    ActivityIndicator,
    StyleProp,
    StyleSheet,
    TextStyle,
    TouchableOpacity,
    useColorScheme,
    ViewStyle
} from "react-native";
import { Text, View } from "../Themed";

interface ButtonProps {
    title: string;
    onPress?: () => void;
    variant?: Variant;
    containerStyle?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    iconName?: ComponentProps<typeof MaterialCommunityIcons>['name'];
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
}

export default function Button({
    title,
    onPress,
    variant = "primary",
    containerStyle,
    textStyle,
    iconName,
    disabled,
    loading,
    fullWidth,
}: ButtonProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const buttonStyles = getVariantStyles(variant, colorScheme);

    return (
        <TouchableOpacity 
            activeOpacity={0.7} 
            style={[
                fullWidth && styles.fullWidth,
                containerStyle
            ]} 
            onPress={onPress} 
            disabled={disabled || loading}
        >
            <View style={[
                styles.container, 
                buttonStyles.container,
                (disabled || loading) && styles.disabled
            ]}>
                {loading ? (
                    <ActivityIndicator color={theme.tintText} size="small" />
                ) : (
                    <>
                        {iconName && (
                            <MaterialCommunityIcons
                                name={iconName}
                                size={20}
                                color={theme.tintText}
                            />
                        )}
                        <Text style={[buttonStyles.text, textStyle]}>{title}</Text>
                    </>
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "center",
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
        gap: 10,
        minHeight: 56,
    },
    fullWidth: {
        width: "100%",
    },
    disabled: {
        opacity: 0.5,
    },
});