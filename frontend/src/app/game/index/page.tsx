/* eslint-disable */
"use client";
import { useState } from 'react';
import { Start } from '@/components/game/index/Start';
import { Wait } from '@/components/game/index/Wait';
import { Display } from '@/components/game/index/Display';

export default function Page() {
    const { openMatchError, setOpenMatchError } = useState(false);
    return (
        <>
        {/* <Start setOpenMatchError={setOpenMatchError} />
        <Wait openMatchError={openMatchError} /> */}
        <Display />
        </>
    )
}