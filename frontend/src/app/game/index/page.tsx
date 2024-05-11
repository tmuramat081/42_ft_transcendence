/* eslint-disable */
"use client";
import { useState, Suspense } from 'react';
import { Start } from '@/components/game/index/Start';
import { Wait, NavigationEventsWait } from '@/components/game/index/Wait';
import { Display } from '@/components/game/index/Display';
import { Layout } from '@/components/game/common/Layout';
import { NavigationEventsHost } from '@/components/game/index/Host';

export default function Page() {
    //const { openMatchError, setOpenMatchError } = useState(false);
    return (
        <Layout title='Game'>
            {/* <Start setOpenMatchError={setOpenMatchError} />
            <Wait openMatchError={openMatchError} /> */}
            <Display />
            <Suspense fallback={null}>
                <NavigationEventsWait />
                <NavigationEventsHost />
            </Suspense>
        </Layout>
    )
}