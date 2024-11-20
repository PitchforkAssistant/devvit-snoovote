import {Devvit} from "@devvit/public-api";
import {SnooVote} from "../../utils/snooVote.js";
import {ChoiceText} from "./choiceText.js";

export type VoteTextProps = {
    vote: SnooVote;
    getVotes: (choiceId: string) => number | undefined;
};

export const VoteText = ({vote, getVotes}: VoteTextProps) => (
    <zstack width="100%" height="100%" grow>
        <vstack alignment="center middle" width="100%" height="100%">
            <spacer height="5%"/>
            <text lightColor={vote.textColor.light} darkColor={vote.textColor.dark} size="xxlarge" style="heading" weight="bold" outline="thick" height="50%" alignment="top center" selectable={false}>{vote.text}</text>
            <spacer grow/>
        </vstack>
        {vote.choices.length < 4 &&
            <hstack width="100%" height="100%" grow>{vote.choices.map(choice => <zstack width={`${100 / vote.choices.length}%`} height="100%" grow><ChoiceText votes={getVotes(choice.id)} choice={choice}/></zstack>)}</hstack>
        }
        {vote.choices.length === 4 &&
            <hstack width="100%" height="100%">
                <vstack width="100%" height="50%">{vote.choices.slice(0, 2).map(choice => <ChoiceText choice={choice} votes={getVotes(choice.id)}/>)}</vstack>
                <vstack width="100%" height="50%">{vote.choices.slice(2, 4).map(choice => <ChoiceText choice={choice} votes={getVotes(choice.id)}/>)}</vstack>
            </hstack>
        }
    </zstack>
);

