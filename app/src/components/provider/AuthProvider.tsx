"use client";

import { Session } from "next-auth";
import { ReactNode, useEffect } from "react";
import { useSetAtom } from "jotai";
import { sessionAtom } from "@src/shared/lib/atom";
import { SessionProvider } from "next-auth/react";

const AuthProvider = ({
    children,
    session,
}: {
    children: ReactNode;
    session: Session | null;
}) => {
    const setSession = useSetAtom(sessionAtom);

    useEffect(() => {
        setSession(session);
    }, [session]);

    return (
        <SessionProvider session={session} refetchInterval={0}>
            {children}
        </SessionProvider>
    );
};

export default AuthProvider;
