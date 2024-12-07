import {Devvit} from "@devvit/public-api";
import {CustomPostState} from "../../postState.js";
// TODO: Improve the HelpPage contents

export const HelpPage = (state: CustomPostState) => {
    const helpState = state.PageStates.help;
    return (
        <vstack alignment="center top" width="100%" height="100%">
            <hstack padding="medium" alignment="center middle" minWidth="100%" border="thick">
                <vstack backgroundColor="rgba(0,0,0,0.5)" cornerRadius="full" padding="xsmall">
                    <button icon="back" size="small" onPress={() => state.changePage("snoos")}/>
                </vstack>
                <spacer grow/>
                <vstack padding="xsmall" alignment="center middle" gap="small">
                    <text style="heading" size="xlarge">SnooVote</text>
                    <text style="metadata" size="large">What is this?</text>
                </vstack>
                <spacer grow/>
                <hstack padding="small">
                    <spacer size="large"/>
                </hstack>
            </hstack>
            <vstack alignment="top center" gap="small" padding="small" width="100%" height="100%" grow>
                <vstack grow border="thick" cornerRadius="small" alignment="center middle" gap="small" padding="medium">
                    <text style="body" size="medium" selectable={false} alignment="center middle" wrap>SnooVote is an interactive post created with Reddit's Developer Platform for the Mod World 2024 event!</text>
                    <text style="body" size="medium" selectable={false} alignment="center middle" wrap>You vote by moving to the area corresponding to your choice. There are multiple polls on the subreddit. At the end of the vote, all Snoos will be frozen in place.</text>
                    <text style="body" size="medium" selectable={false} alignment="center middle" wrap>Large crowds on a single post may reduce performance. If you experience signficiantly delayed movement, please be patient or try voting on one of the other polls. You can also toggle the visibility of inactive snoos using the button in the buttom right.</text>
                </vstack>
                <hstack width="100%" gap="small">
                    <hstack width="100%" grow border="thick" cornerRadius="small" alignment="center middle" gap="small" padding="small" onPress={() => helpState.discordPressed()}>
                        <text maxHeight="100%" grow size="medium" selectable={false} wrap onPress={() => helpState.discordPressed()}>Visit the Apps Showcase</text>
                        <image url={state.context.assets.getURL("Snoo_Moderator_Features.png")} onPress={() => helpState.morePressed()} imageHeight={100} imageWidth={80} resizeMode="fit"/>
                    </hstack>
                    <hstack width="100%" grow border="thick" cornerRadius="small" alignment="center middle" gap="small" padding="small" onPress={() => helpState.discordPressed()} >
                        <text maxHeight="100%" grow size="medium" selectable={false} wrap onPress={() => helpState.discordPressed()} >Join the Mod World Discord</text>
                        <image url={state.context.assets.getURL("discord-mark-blue.png")} onPress={() => helpState.discordPressed()} imageHeight={100} imageWidth={80} resizeMode="fit"/>
                    </hstack>
                </hstack>
            </vstack>
        </vstack>
    );
};

