import {Devvit} from "@devvit/public-api";
import {CustomPostState} from "../../postState.js";
// TODO: Improve the HelpPage contents
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const HelpPage = (state: CustomPostState) => (
    <vstack alignment="top center" padding="small" width="100%" height="100%" grow>
        <vstack alignment="center middle" gap="medium" padding="large">
            <text style="heading" wrap alignment="center">What is this?</text>

            <spacer size="medium" shape="thin" width="100%"/>

            <text style="body" wrap alignment="center">
                This is a custom post type that allows you to walk around with your Snoovatar and vote on polls.
            </text>

            <text style="body" wrap alignment="center">
                You can move your Snoovatar by using the arrow arrow buttons at the bottom left of the post.
            </text>

            <text style="body" wrap alignment="center">
                Voting on polls is based on your snoovatar's position in the world. You can vote on polls by walking to the area that corresponds to the option you choose.
            </text>

            <text style="body" wrap alignment="center">
                You can hide users that aren't currently here by using th button at the bottom right of the post.
            </text>

            <spacer size="xsmall" grow/>
        </vstack>
    </vstack>
);

