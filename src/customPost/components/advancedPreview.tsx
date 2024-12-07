import {Devvit} from "@devvit/public-api";
import {SnooVote} from "../../utils/snooVote.js";
import {UIDimensions} from "@devvit/protos";
import {VoteBackground} from "./voteBg.js";
import {VoteText} from "./voteText.js";

export type AdvancedPreviewProps = {
    vote: SnooVote;
    uiDims: UIDimensions;
    getVotes: (choiceId: string) => number | undefined;
};

export const AdvancedPreview = (props: AdvancedPreviewProps) => (
    <blocks height="tall">
        <zstack width="100%" height="100%" grow>
            {props && props.vote ? <VoteBackground vote={props.vote} uiDims={props.uiDims}/> : null}
            {props && props.vote ? <VoteText vote={props.vote} getVotes={props.getVotes}/> : null}
        </zstack>
    </blocks>
);

export const advancedPreviewMaker = ({vote, uiDims, getVotes}: AdvancedPreviewProps) => <AdvancedPreview vote={vote} uiDims={uiDims} getVotes={getVotes}/>;

