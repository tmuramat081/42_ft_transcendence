"use client"
import React, {
    createContext,
    Dispatch,
    ReactNode,
    SetStateAction,
    useContext,
    useState
} from "react";

import {User} from "../types/user"

import { usePrivateRoute } from '@/hooks/routes/usePrivateRouter'
import { usePublicRoute } from "@/hooks/routes/usePublicRoute";
import { useRouterGuard } from "@/hooks/routes/useRouterGuard";

import { useAuth } from "./useAuth";

type AccessControlContextType = {

};

// ミドルウェアでできるといい・・・ useContextのユーザー情報を使ってアクセス制御がmiddlewareでできない
const accessControlContext = createContext<AccessControlContextType>({} as AccessControlContextType)

export const AccessControlProvider = (props: {children: ReactNode}) => {

    const { children } = props
    const { loading } = useAuth()
    
    // usePrivateRoute()
    // usePublicRoute()

    useRouterGuard()

    return (
        <accessControlContext.Provider value={{}}>
            {children}
        </accessControlContext.Provider>
    )
}