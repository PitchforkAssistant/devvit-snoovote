import {Devvit} from "@devvit/public-api";
import {CustomPostState} from "../../postState.js";

export const ManagerPage = (state: CustomPostState) => {
    const managerState = state.PageStates?.manager;

    return (

        <vstack alignment="center top" width="100%" height="100%">
            <hstack padding="medium" alignment="center middle" minWidth="100%" border="thick">
                <vstack backgroundColor="rgba(0,0,0,0.5)" cornerRadius="full" padding="xsmall">
                    <button icon="back" size="small" onPress={() => state.changePage("snoos")}/>
                </vstack>
                <spacer grow/>
                <vstack padding="xsmall" alignment="center middle" gap="small">
                    <text style="heading" size="xlarge">Management Options</text>
                </vstack>
                <spacer grow/>
                <hstack padding="small">
                    <spacer size="large"/>
                </hstack>
            </hstack>
            <vstack alignment="top center" gap="small" padding="small" width="100%" grow>
                <vstack alignment="center middle" gap="medium" padding="medium">
                    <button appearance="success" onPress={async () => managerState.observerPressed()}>Enter Observer Mode</button>
                    <button appearance="secondary" onPress={async () => managerState.changeVotePressed()}>Change Active Vote</button>
                    <button appearance="secondary" onPress={async () => managerState.toggleFrozenPressed()}>{managerState.isFrozen ? "Unfreeze" : "Freeze"} Current Vote</button>
                    <button appearance="secondary" onPress={async () => managerState.sendRefreshPressed()}>Send Refresh</button>
                    <button appearance="secondary" onPress={async () => managerState.updatePreviewPressed()}>Update Preview</button>
                    <button appearance="caution" onPress={async () => managerState.editRawVotePressed()}>Edit Raw Vote Data</button>
                    <button appearance="destructive" onPress={async () => managerState.resetVotePressed()}>Reset Current Vote</button>
                </vstack>
            </vstack>
        </vstack>

    );
};

