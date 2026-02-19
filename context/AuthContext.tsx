import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { createContext, ReactNode, useEffect, useState } from "react";

export const AuthContext = createContext<{session: Session | null}>({session: null});

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session);
        })
        
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        })

        return () => listener.subscription.unsubscribe();
    }, []);

    return <AuthContext.Provider value={{session}}>{children}</AuthContext.Provider>
}