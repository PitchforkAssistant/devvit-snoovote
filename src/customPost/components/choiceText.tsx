import {Devvit} from "@devvit/public-api";
import {SnooVoteChoice} from "../../utils/snooVote.js";

export type ChoiceTextProps = {
    choice: SnooVoteChoice;
    votes?: number;
};

export const ChoiceText = ({choice, votes}: ChoiceTextProps) => (
    <zstack grow width="100%" height="100%">
        <spacer grow/>
        <vstack alignment="center middle" width="100%" height="100%">
            <spacer height="10%"/>
            <text lightColor={choice.textColor.light} darkColor={choice.textColor.dark} size="xlarge" style="heading" weight="bold" outline="thick" alignment="top center" selectable={false}>{choice.text}</text>
            <text lightColor={choice.textColor.light} darkColor={choice.textColor.dark} size="xxlarge" style="heading" weight="bold" outline="thick" alignment="top center" selectable={false}>{votes ? votes : ""}</text>
            <spacer grow/>
        </vstack>
        <spacer grow/>
    </zstack>
);

