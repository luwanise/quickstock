import Colors from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { InputModeOptions, StyleSheet, TextInput, useColorScheme } from "react-native";
import { View } from "../Themed";

interface CustomTextInputProps {
    placeholder: string,
    value: any
    onChangeText: (value: any) => void
    inputMode?: InputModeOptions
    iconName?: ComponentProps<typeof MaterialIcons>['name'];
    secureTextEntry?: boolean
}

export default function CustomTextInput(props: CustomTextInputProps) {
    const colorScheme = useColorScheme();

    return (
        <View style={[
            styles.container,
            {
                backgroundColor: colorScheme === "dark" ? "#111" : "#fff",
                borderColor: colorScheme === "dark" ? "#ccc" : "#ccc",
            }
        ]}>
            {props.iconName && (
                <MaterialIcons
                    name={props.iconName}
                    size={20}
                    color={Colors[colorScheme ?? 'light'].tint}
                />
            )}
            <TextInput
                style={{ color: Colors[colorScheme ?? 'light'].text, width: "100%" }}
                placeholder={props.placeholder}
                placeholderTextColor="#ccc"
                value={props.value}
                onChangeText={props.onChangeText}
                inputMode={props.inputMode}
                secureTextEntry={props.secureTextEntry}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        borderWidth: 1,
        marginBottom: 16,
        borderRadius: 5,
        paddingHorizontal: 10
    }
})