/* eslint-disable */
"use client";
import { useState, Suspense } from 'react';
import { Start } from '@/components/game/index/Start';
import { Wait, NavigationEvents } from '@/components/game/index/Wait';
import { Display } from '@/components/game/index/Display';

export default function Page() {
    //const { openMatchError, setOpenMatchError } = useState(false);
    return (
        <>
        {/* <Start setOpenMatchError={setOpenMatchError} />
        <Wait openMatchError={openMatchError} /> */}
        <Display />
        <Suspense fallback={null}>
            <NavigationEvents />
        </Suspense>
        </>
    )
}