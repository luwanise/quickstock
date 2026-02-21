import Colors from "@/constants/Colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ComponentProps, useCallback, useState } from "react";
import {
    Animated,
    InputModeOptions,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    useColorScheme,
} from "react-native";
import { Text, View } from "../Themed";

interface CustomTextInputProps {
    placeholder: string;
    value: any;
    onChangeText: (value: any) => void;
    onBlur?: () => void;
    onFocus?: () => void;
    inputMode?: InputModeOptions;
    iconName?: ComponentProps<typeof MaterialCommunityIcons>['name'];
    secureTextEntry?: boolean;
    error?: string;
    touched?: boolean;
    editable?: boolean;
    maxLength?: number;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    autoCorrect?: boolean;
}

export default function CustomTextInput({ 
    error,
    touched,
    onBlur,
    onFocus,
    editable = true,
    autoCapitalize = 'none',
    autoCorrect = false,
    ...props 
}: CustomTextInputProps) {
    const colorScheme = useColorScheme();
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [animatedScale] = useState(new Animated.Value(1));
    
    const theme = Colors[colorScheme ?? 'light'];
    
    const hasError = error && touched;
    const borderColor = hasError 
        ? theme.danger 
        : isFocused 
            ? theme.tint 
            : colorScheme === "dark" ? "#38383a" : "#e0e0e0";

    const backgroundColor = !editable 
        ? colorScheme === "dark" ? "#2c2c2e" : "#f5f5f5"
        : colorScheme === "dark" ? "#1c1c1e" : "#fff";

    const handleFocus = useCallback(() => {
        setIsFocused(true);
        onFocus?.();
        
        // Subtle scale animation on focus
        Animated.spring(animatedScale, {
            toValue: 1.02,
            useNativeDriver: true,
            friction: 8,
        }).start();
    }, [onFocus, animatedScale]);

    const handleBlur = useCallback(() => {
        setIsFocused(false);
        onBlur?.();
        
        // Reset scale on blur
        Animated.spring(animatedScale, {
            toValue: 1,
            useNativeDriver: true,
            friction: 8,
        }).start();
    }, [onBlur, animatedScale]);

    return (
        <View style={styles.wrapper}>
            <Animated.View
                style={[
                    styles.container,
                    {
                        backgroundColor,
                        borderColor,
                        borderWidth: hasError ? 2 : 1,
                        transform: [{ scale: animatedScale }],
                        opacity: editable ? 1 : 0.7,
                    }
                ]}
            >
                {props.iconName && (
                    <MaterialCommunityIcons
                        name={props.iconName}
                        size={20}
                        color={hasError ? theme.danger : isFocused ? theme.tint : theme.textSecondary}
                    />
                )}
                <TextInput
                    style={[
                        styles.input,
                        { color: theme.text }
                    ]}
                    placeholder={props.placeholder}
                    placeholderTextColor={theme.textSecondary}
                    value={props.value}
                    onChangeText={props.onChangeText}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    inputMode={props.inputMode}
                    secureTextEntry={props.secureTextEntry && !showPassword}
                    editable={editable}
                    maxLength={props.maxLength}
                    autoCapitalize={autoCapitalize}
                    autoCorrect={autoCorrect}
                />
                {props.secureTextEntry && (
                    <TouchableOpacity 
                        onPress={() => setShowPassword(!showPassword)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <MaterialCommunityIcons
                            name={showPassword ? "eye-off" : "eye"}
                            size={20}
                            color={theme.textSecondary}
                        />
                    </TouchableOpacity>
                )}
                {props.maxLength && props.value?.length > 0 && (
                    <Text style={[styles.counter, { color: theme.textSecondary }]}>
                        {props.value.length}/{props.maxLength}
                    </Text>
                )}
            </Animated.View>
            {hasError && (
                <Animated.View 
                    style={[
                        styles.errorContainer,
                        {
                            opacity: animatedScale.interpolate({
                                inputRange: [1, 1.02],
                                outputRange: [0.9, 1]
                            })
                        }
                    ]}
                >
                    <MaterialCommunityIcons 
                        name="alert-circle-outline" 
                        size={14} 
                        color={theme.danger} 
                    />
                    <Text style={[styles.errorText, { color: theme.danger }]}>
                        {error}
                    </Text>
                </Animated.View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        width: "100%",
        backgroundColor: "transparent",
    },
    container: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56,
        gap: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        padding: 0,
    },
    errorContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 6,
        marginLeft: 12,
        gap: 4,
        backgroundColor: "transparent",
    },
    errorText: {
        fontSize: 12,
        fontWeight: "500",
    },
    counter: {
        fontSize: 12,
        fontWeight: "500",
    },
});