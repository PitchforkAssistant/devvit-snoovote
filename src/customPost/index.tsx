import {Devvit} from "@devvit/public-api";
import {CustomPostState} from "./postState.js";
import {Page} from "./pages.js";
import {stringifyChannelStatus} from "../utils/status.js";

export const snooVotePost = Devvit.addCustomPostType({
    name: "Snoo Vote",
    description: "Walk around with your Snoovatar and vote on polls!",
    height: "tall",
    render: context => {
        const state = new CustomPostState(context);
        return (
            <blocks height="tall">
                <zstack width="100%" height="100%">
                    <Page state={state} />
                    {state.isDebug && <vstack alignment="start top" grow>
                        <text style="body" color="red">DEBUG MODE</text>
                        <text>pos: {JSON.stringify(state.PageStates.snoos.mySnoovatar?.position)}</text>
                        <text>status: {stringifyChannelStatus(state.PageStates.snoos.status)}</text>
                        <text>isManager: {state.isManager}</text>
                    </vstack>}
                    <vstack alignment="center top" width="100%" height="100%">
                        <hstack padding="medium" alignment="center middle" minWidth="100%">
                            <spacer size="xsmall" grow/>
                            <vstack backgroundColor="rgba(0,0,0,0.5)" cornerRadius="full" padding="xsmall">
                                {state.currentPage === "snoos" && <button icon="settings" size="small" onPress={() => state.changePage("manager")}/>}
                            </vstack>
                        </hstack>
                        <vstack alignment="center middle" grow width="100%" height="100%">
                            <spacer size="xsmall" grow/>
                        </vstack>
                        <hstack padding="medium" alignment="center middle" minWidth="100%">
                            <spacer size="xsmall" grow/>
                            <vstack backgroundColor="rgba(0,0,0,0.5)" cornerRadius="full" padding="xsmall">
                                {state.currentPage === "snoos" && <button icon="help" size="small" onPress={() => state.changePage("help")}/>}
                                {state.currentPage !== "snoos" && <button icon="back" size="small" onPress={() => state.changePage("snoos")}/>}
                            </vstack>
                        </hstack>
                    </vstack>
                </zstack>
            </blocks>
        );
    },
});
