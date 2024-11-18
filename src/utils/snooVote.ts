import {Devvit, RedisClient} from "@devvit/public-api";
import {DualColor, isDualColor} from "./dualColor.js";

export const votesStoreKey = "snoo:votes";
export const votesAssociationKey = "snoo:votes:association";

export type SnooImageOptions = {
    backgroundImage: string;
    backgroundImageMode: Devvit.Blocks.ImageResizeMode;
}

export type SnooVoteResult = {
    winnerId: string;
    votes: {[choiceId: string]: number};
}

export type SnooVoteChoice = {
    id: string;
    text: string;
    textColor: DualColor;
    backgroundColor: DualColor;
    nameplateBackgroundColor?: DualColor;
    nameplateTextColor?: DualColor;
    backgroundImage?: SnooImageOptions;
    result?: SnooVoteResult;
}

export type SnooVote = {
    id: string;
    name: string;
    text: string;
    textColor: DualColor;
    backgroundColor: DualColor;
    choices: SnooVoteChoice[];
    result: SnooVoteResult;
}

export function isSnooImageOptions (object: unknown): object is SnooImageOptions {
    if (!object || typeof object !== "object") {
        return false;
    }
    const snooImageOptions = object as SnooImageOptions;
    return typeof snooImageOptions.backgroundImage === "string" &&
           typeof snooImageOptions.backgroundImageMode === "string";
}

export function isSnooVoteResult (object: unknown): object is SnooVoteResult {
    if (!object || typeof object !== "object") {
        return false;
    }
    const snooVoteResult = object as SnooVoteResult;
    return typeof snooVoteResult.winnerId === "string" &&
           typeof snooVoteResult.votes === "object" &&
           Object.values(snooVoteResult.votes).every(vote => typeof vote === "number");
}

export function isSnooVoteChoice (object: unknown): object is SnooVoteChoice {
    if (!object || typeof object !== "object") {
        return false;
    }
    const snooVoteChoice = object as SnooVoteChoice;
    return typeof snooVoteChoice.id === "string" &&
           typeof snooVoteChoice.text === "string" &&
           isDualColor(snooVoteChoice.textColor) &&
           isDualColor(snooVoteChoice.backgroundColor) &&
           isDualColor(snooVoteChoice.nameplateBackgroundColor) &&
           isDualColor(snooVoteChoice.nameplateTextColor) &&
           (snooVoteChoice.backgroundImage ? isSnooImageOptions(snooVoteChoice.backgroundImage) : true);
}

export function isSnooVote (object: unknown): object is SnooVote {
    if (!object || typeof object !== "object") {
        return false;
    }
    const snooVote = object as SnooVote;
    return typeof snooVote.id === "string" &&
           typeof snooVote.text === "string" &&
           isDualColor(snooVote.textColor) &&
           isDualColor(snooVote.backgroundColor) &&
           Array.isArray(snooVote.choices) &&
           snooVote.choices.every(isSnooVoteChoice) &&
           (snooVote.result ? isSnooVoteResult(snooVote.result) : true);
}

export async function storeSnooVote (redis: RedisClient, vote: SnooVote): Promise<void> {
    await redis.hSet(votesStoreKey, {voteId: JSON.stringify(vote)});
}

export async function getPostSnooVoteId (redis: RedisClient, postId: string): Promise<string | null> {
    const voteId = await redis.hGet(votesAssociationKey, postId);
    if (!voteId) {
        return null;
    }
    return voteId;
}

export async function getPostSnooVote (redis: RedisClient, postId: string): Promise<SnooVote | null> {
    const voteId = await getPostSnooVoteId(redis, postId);
    if (!voteId) {
        return null;
    }
    const vote = await redis.hGet(votesStoreKey, voteId);
    if (!vote) {
        return null;
    }
    const parsedVote: unknown = JSON.parse(vote);
    if (!isSnooVote(parsedVote)) {
        return null;
    }
    return parsedVote;
}

export async function setPostSnooVote (redis: RedisClient, postId: string, voteId: string): Promise<void> {
    await redis.hSet(votesAssociationKey, {[postId]: voteId});
}
