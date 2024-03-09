/* eslint-disable */
"use client";
import { useState } from 'react';
import SignIn from '@/components/auth/signin_mui';
import SignUp from '@/components/auth/signup_mui';

export default function Page() {
    return (
        <>
        <SignIn />
        <SignUp />
        </>
    )
}
