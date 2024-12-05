import {Devvit} from "@devvit/public-api";
import {CustomPostState} from "../../postState.js";
import {Snoo} from "../../components/snoo.js";
import {Controls} from "../../components/controls.js";
import {ChannelStatus} from "@devvit/public-api/types/realtime.js";
import {StepSize, WorldBounds} from "./snoosState.js";
import {VoteBackground} from "../../components/voteBg.js";
import {VoteText} from "../../components/voteText.js";
import {Prefs} from "../../components/prefs.js";

export const SnoosPage = (state: CustomPostState) => {
    const snooState = state.PageStates?.snoos;

    const uiDims = snooState.context.dimensions ?? {width: 320, height: 379, scale: 1};

    return (
        <zstack width="100%" height="100%" grow>
            {!snooState._initialVote.loading && snooState.currentVote ? <VoteBackground vote={snooState.currentVote} uiDims={uiDims}/> : ""}
            {!(!snooState.showInactive && snooState.currentVote?.frozen) && snooState.displayWorld.map(snoo => <Snoo snoo={snoo} scale={snoo.position.z} uiDims={uiDims}/>)}
            {!snooState._initialVote.loading && snooState.currentVote ? <VoteText vote={snooState.currentVote} getVotes={snooState.getVotes}/> : ""}
            {snooState.mySnoovatar && !snooState.currentVote?.frozen && !snooState.isObserver && <Controls step={StepSize} bounds={WorldBounds} pos={snooState.mySnoovatar.position} disabled={snooState.status !== ChannelStatus.Connected} isManager={snooState.postState.isManager} onPress={snooState.moveSnoovatar}/>}
            {snooState.postState.currentUserId && <Prefs showInactives={snooState.showInactive} onInactivesToggle={snooState.toggleInactives}/>}
        </zstack>
    );
};
