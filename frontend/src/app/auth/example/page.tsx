/* eslint-disable */
"use client";
import { useState } from 'react';
import SignIn from '@/components/auth/signin/signin_mui';
import SignUp from '@/components/auth/signup/signup_mui';

export default function Page() {
    return (
        <>
        <SignIn />
        <SignUp />
        </>
    )
}
