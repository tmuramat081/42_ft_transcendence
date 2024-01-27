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

import { usePrivateRoute } from '@/hooks/usePrivateRouter'
import { usePublicRoute } from "@/hooks/usePublicRoute";

type AccessControlContextType = {

};

const accessControlContext = createContext<AccessControlContextType>({} as AccessControlContextType)

export const AccessControlProvider = (props: {children: ReactNode}) => {

    const { children } = props
    usePrivateRoute()
    usePublicRoute()

    return (
        <accessControlContext.Provider value={{}}>
            {children}
        </accessControlContext.Provider>
    )
}