'use client';
import { NextPage } from "next";
import { Setting } from "@/components/game/battle/Setting"; 
import { usePlayStateStore, PlayState } from "@/store/game/playState";
import { FinishedGameInfo } from "@/types/game/game";
import { useState, Suspense } from "react";
import { Layout } from "@/components/game/common/Layout";
import { Result } from "@/components/game/battle/Result";
import { Play} from "@/components/game/battle/Play";
import { NavigationEvents } from "@/components/game/battle/Setting";

// test
import { useEffect } from "react";

const defaultFinishedGameInfo: FinishedGameInfo = {
    winnerName: "",
    loserName: "",
    winnerScore: 0,
    loserScore: 0,
};

export default function Battle() {
    const { playState } = usePlayStateStore();
    const [finishedGameInfo, setFinishedGameInfo] = useState<FinishedGameInfo>(defaultFinishedGameInfo);

    // test
    const updatePlayState = usePlayStateStore((store) => store.updatePlayState);
    useEffect(() => {
        //updatePlayState(PlayState.stateSelecting);
        //updatePlayState(PlayState.stateFinished);
    }, []);

    return (
        <Layout title='Play'>
            {(playState === PlayState.stateSelecting || 
                playState === PlayState.stateStandingBy) && <Setting />}
            {playState === PlayState.statePlaying && (
                <Play updateFinishedGameInfo={setFinishedGameInfo}/>
            )}
            {(playState === PlayState.stateFinished || playState === PlayState.stateCanceled || playState === PlayState.stateNothing) && (
                <Result finishedGameInfo={finishedGameInfo} />
            )}

            <Suspense fallback={null}>
                <NavigationEvents />
            </Suspense>

            {/* <Setting /> */}

            {/* {(playState === PlayState.stateFinished ||
                playState === PlayState.stateCanceled ||
                playState === PlayState.stateNothing) && (
                <Result finishedGameInfo={finishedGameInfo} />
            )} */}
            {/* <Result finishedGameInfo={finishedGameInfo} /> */}
        </Layout>
        // <Setting />
        // <>
        // {(playState === PlayState.stateSelecting || playState === PlayState.stateStandingBy) && <Setting />}
        // </>
    )
}