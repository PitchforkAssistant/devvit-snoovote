import {Devvit} from "@devvit/public-api";
import {CustomPostState} from "../postState.js";
import {Snoo} from "../components/snoo.js";
import {Controls} from "../components/controls.js";
import {ChannelStatus} from "@devvit/public-api/types/realtime.js";
import {SnoovatarData, StepSize, WorldBounds} from "../snooManager.js";

export const SnoosPage = (state: CustomPostState) => {
    const snooState = state.PageStates?.snoos;

    // Scaled up snoos are always on top
    // Your own snoo is always on top of other snoos, except when they are scaled up
    function compareSnoos (a: SnoovatarData, b: SnoovatarData) {
        if (a.position.z !== b.position.z) {
            return a.position.z - b.position.z;
        }

        if (a.id === snooState.mySnoovatar?.id) {
            return 1;
        }
        if (b.id === snooState.mySnoovatar?.id) {
            return -1;
        }
        // If we were to return 0 here, the order of snoos would be non-deterministic and cause z-fighting
        // Instead this will sort by the user IDs, which essentially means it's based on account age
        return b.id.localeCompare(a.id);
    }

    return (
        <zstack width="100%" height="100%" grow>
            {Object.values(snooState._world[0]).sort(compareSnoos).map(snoo => <Snoo snoo={snoo} scale={snoo.position.z} uiDims={snooState.context.dimensions ?? {width: 320, height: 379, scale: 1}}/>)}
            {snooState.mySnoovatar && <Controls step={StepSize} bounds={WorldBounds} pos={snooState.mySnoovatar.position} disabled={snooState.status !== ChannelStatus.Connected} isManager={snooState.postState.isManager} onPress={snooState.moveSnoovatar}/>}
        </zstack>
    );
};

