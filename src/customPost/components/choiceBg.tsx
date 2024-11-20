import {Devvit} from "@devvit/public-api";
import {SnooVoteChoice} from "../../utils/snooVote.js";
import {UIDimensions} from "@devvit/protos";

export type ChoiceBackgroundProps = {
    choice: SnooVoteChoice;
    uiDims: UIDimensions;
};

export const ChoiceBackground = ({choice, uiDims}: ChoiceBackgroundProps) => (
    <zstack lightBackgroundColor={choice.backgroundColor.light} darkBackgroundColor={choice.backgroundColor.dark} grow width="100%" height="100%">

        {choice.backgroundImage && (choice.backgroundImage.mode === "cover" || choice.backgroundImage.mode === "fill")
            ? <image url={choice.backgroundImage.url} imageHeight={uiDims.height} imageWidth={uiDims.width} resizeMode={choice.backgroundImage.mode}/> : ""}
        <vstack alignment="center middle" width="100%" height="100%" grow>
            <spacer minHeight="20%" grow/>
            {choice.backgroundImage && (choice.backgroundImage.mode !== "cover" && choice.backgroundImage.mode !== "fill")
                ? <image url={choice.backgroundImage.url} imageHeight={Math.round(uiDims.height * 0.5)} imageWidth={Math.round(uiDims.width * 0.5)} resizeMode={choice.backgroundImage.mode}/> : ""}
            <spacer minHeight="20%" grow/>
        </vstack>
    </zstack>
);

