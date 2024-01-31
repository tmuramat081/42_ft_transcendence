"use client"

import {signIn, signOut} from 'next-auth/react'

export const LoginButton = () => {
    return (
        // <button style={{marginRight: 10}} onClick={() => signIn(undefined, { callbackUrl: 'http://localhost:3000/' })}>
        <button style={{marginRight: 10}} onClick={() => signIn()}>
            SignIn
        </button>
    )
}

export const LoginButton42 = () => {
    return (
        // <button style={{marginRight: 10}} onClick={() => signIn(undefined, { callbackUrl: 'http://localhost:3000/' })}>
        <button style={{marginRight: 10}} onClick={() => signIn("42-school")}>
            SignIn
        </button>
    )
}


export const LogoutButton = () => {
    return (
        <button style={{marginRight: 10}} onClick={() => signOut()}>
            SignOut
        </button>
    )
}