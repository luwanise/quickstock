import { ColorSchemeName } from "react-native";
import Colors from "./Colors";


export function getScreenOptions(colorScheme: ColorSchemeName) {
    return ({
        headerTitleAlign: 'center' as const,
        headerTitleStyle: { fontSize: 17 },
        headerShadowVisible: false,
        headerStatusBarHeight: 30,
        headerStyle: { backgroundColor: Colors[colorScheme ?? 'light'].background },
    })
}