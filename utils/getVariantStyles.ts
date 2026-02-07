import Colors from "@/constants/Colors";
import { ColorSchemeName } from "react-native";

export type Variant = "primary" | "outline" | "danger";

export function getVariantStyles(variant: Variant, colorScheme?: ColorSchemeName) {
    const isDark = colorScheme === "dark";

    switch(variant) {
        case "outline":
            return {
                container: {
                    borderWidth: 1,
                    borderColor: isDark ? Colors.dark.tint : Colors.light.tint,
                },
                text: {
                    color: isDark ? Colors.dark.tint : Colors.light.tint,
                }
            }
        case "danger":
            return {
                container: {
                    backgroundColor: isDark ? Colors.dark.danger : Colors.light.danger,
                },
                text: {
                    color: isDark ? "white" : "white"
                }
            }
        default:
            return {
                container: {
                    backgroundColor: isDark ? Colors.dark.tint : Colors.light.tint,
                },
                text: {
                    color: isDark ? "black" : "white"
                }
            }
    }
}