import { useAuth } from "@/hooks/useAuth";
import { router } from "expo-router";
import { ReactNode, useEffect } from "react";

interface Props {
    children: ReactNode
}

export function ProtectedRoute({ children }: Props) {
    const { session } = useAuth();

    useEffect(() => {
        if (!session) {
            router.push("/login");
        }
    }, [session])

    if (!session) {
        return null;
    }
    
    return <>{children}</>
}