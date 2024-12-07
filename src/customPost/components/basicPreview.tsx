import {Devvit} from "@devvit/public-api";

export const BasicPreview: JSX.Element = (
    <blocks height="tall">
        <vstack alignment="middle center" grow>
            <image url="https://i.redd.it/rihaecdvoc5e1.png" imageHeight={100} imageWidth={100} resizeMode="fit"/>
            <text style="heading">Loading SnooVote Post...</text>
            <text style="body">This may take a few moments depending on the number of Snoovatars.</text>
        </vstack>
    </blocks>
);
