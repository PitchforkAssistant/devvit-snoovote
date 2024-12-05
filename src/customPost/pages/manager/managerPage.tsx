import {Devvit} from "@devvit/public-api";
import {CustomPostState} from "../../postState.js";

export const ManagerPage = (state: CustomPostState) => {
    const managerState = state.PageStates?.manager;

    return (
        <vstack alignment="top center" gap="small" padding="small" width="100%" grow>
            <vstack alignment="center middle" gap="large" padding="large">
                <button appearance="success" onPress={async () => managerState.observerPressed()}>Enter Observer Mode</button>
                <button appearance="secondary" onPress={async () => managerState.changeVotePressed()}>Change Active Vote</button>
                <button appearance="secondary" onPress={async () => managerState.toggleFrozenPressed()}>{managerState.isFrozen ? "Unfreeze" : "Freeze"} Current Vote</button>
                <button appearance="secondary" onPress={async () => managerState.changeVotePressed()}>Send Refresh</button>
                <button appearance="caution" onPress={async () => managerState.editRawVotePressed()}>Edit Raw Vote Data</button>
                <button appearance="destructive" onPress={async () => managerState.resetVotePressed()}>Reset Current Vote</button>
            </vstack>
        </vstack>
    );
};

