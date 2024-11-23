import {Devvit} from "@devvit/public-api";
import {SnooVote} from "../../utils/snooVote.js";
import {UIDimensions} from "@devvit/protos";
import {ChoiceBackground} from "./choiceBg.js";

export type BackgroundProps = {
    vote: SnooVote;
    uiDims: UIDimensions;
};

export const VoteBackground = ({vote, uiDims}: BackgroundProps) => (
    <zstack lightBackgroundColor={vote.backgroundColor.light} darkBackgroundColor={vote.backgroundColor.dark} width="100%" height="100%" grow>
        {vote.choices.length < 4 &&
            <hstack width="100%" height="100%" grow>{vote.choices.map(choice => <zstack width={`${100 / vote.choices.length}%`} height="100%" grow><ChoiceBackground choice={choice} uiDims={uiDims}/></zstack>)}</hstack>
        }
        {vote.choices.length === 4 &&
            <vstack width="100%" height="100%">
                <hstack width="100%" height="50%">{vote.choices.slice(0, 2).map(choice => <ChoiceBackground choice={choice} uiDims={uiDims}/>)}</hstack>
                <hstack width="100%" height="50%">{vote.choices.slice(2, 4).map(choice => <ChoiceBackground choice={choice} uiDims={uiDims}/>)}</hstack>
            </vstack>
        }
    </zstack>
);

