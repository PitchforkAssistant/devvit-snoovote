import {Devvit} from "@devvit/public-api";
import {CustomPostState} from "../../postState.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const HelpPage = (state: CustomPostState) => (
    <vstack alignment="top center" gap="small" padding="small" width="100%" grow>
        <vstack alignment="center middle" gap="none">
            <text style="heading" wrap alignment="center">What is this?</text>
            <text style="body" wrap alignment="center">
                TODO: Help page
            </text>
        </vstack>
    </vstack>
);

