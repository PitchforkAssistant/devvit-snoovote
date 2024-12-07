import {Devvit, RedisClient} from "@devvit/public-api";
import {DualColor, isDualColor} from "./dualColor.js";

export const votesStoreKey = "snoo:votes";
export const votesAssociationKey = "snoo:votes:association";
export const previewUpdateQueue = "snoo:votes:previews";

export type SnooImageOptions = {
    url: string;
    mode: Devvit.Blocks.ImageResizeMode;
}

export type SnooVoteResult = {
    winnerId: string;
    time?: number;
    votes: {[choiceId: string]: number};
}

export type SnooVoteChoice = {
    id: string;
    text: string;
    textColor: DualColor;
    backgroundColor: DualColor;
    backgroundImage?: SnooImageOptions;
    result?: number;
}

export type SnooVote = {
    id: string;
    name: string;
    text: string;
    textColor: DualColor;
    backgroundColor: DualColor;
    choices: SnooVoteChoice[];
    frozen?: boolean;
    result?: SnooVoteResult;
}

export function isSnooImageOptions (object: unknown): object is SnooImageOptions {
    if (!object || typeof object !== "object") {
        return false;
    }
    const snooImageOptions = object as SnooImageOptions;
    return typeof snooImageOptions.url === "string" &&
           typeof snooImageOptions.mode === "string";
}

export function isSnooVoteResult (object: unknown): object is SnooVoteResult {
    if (!object || typeof object !== "object") {
        return false;
    }
    const snooVoteResult = object as SnooVoteResult;
    return typeof snooVoteResult.winnerId === "string" &&
           typeof snooVoteResult.votes === "object" &&
           Object.values(snooVoteResult.votes).every(vote => typeof vote === "number") &&
           (snooVoteResult.time === undefined || typeof snooVoteResult.time === "number");
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
           (snooVote.result ? isSnooVoteResult(snooVote.result) : true) &&
           (snooVote.frozen === undefined || typeof snooVote.frozen === "boolean");
}

export async function storeSnooVote (redis: RedisClient, authorId: string, vote: SnooVote): Promise<void> {
    await redis.hSet(votesStoreKey, {[vote.id]: JSON.stringify(vote)});
    await redis.zAdd(`votes:${authorId}`, {member: vote.id, score: Date.now()});
}

export async function updateSnooVote (redis: RedisClient, vote: SnooVote): Promise<void> {
    await redis.hSet(votesStoreKey, {[vote.id]: JSON.stringify(vote)});
}

export async function getPostSnooVoteId (redis: RedisClient, postId: string): Promise<string | null> {
    const voteId = await redis.hGet(votesAssociationKey, postId);
    if (!voteId) {
        return null;
    }
    return voteId;
}

export async function getSnooVote (redis: RedisClient, voteId: string): Promise<SnooVote | null> {
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

export async function getPostSnooVote (redis: RedisClient, postId: string): Promise<SnooVote | null> {
    const voteId = await getPostSnooVoteId(redis, postId);
    if (!voteId) {
        return null;
    }
    return getSnooVote(redis, voteId);
}

export async function setPostSnooVote (redis: RedisClient, postId: string, voteId: string): Promise<void> {
    await redis.hSet(votesAssociationKey, {[postId]: voteId});
}

export async function isVoteOwner (redis: RedisClient, authorId: string, voteId: string): Promise<boolean> {
    const votes = await redis.zRange(`votes:${authorId}`, 0, -1);
    for (const vote of votes) {
        if (vote.member === voteId) {
            return true;
        }
    }
    return false;
}

export async function getAllSnooVotes (redis: RedisClient, authorId?: string): Promise<SnooVote[]> {
    const allVotes = await redis.hGetAll(votesStoreKey);
    // All votes if no author is specified
    if (!authorId) {
        return Object.values(allVotes).map(vote => JSON.parse(vote) as unknown).filter(isSnooVote);
    }

    const ownedVoteIds = await redis.zRange(`votes:${authorId}`, 0, -1);
    const ownedVotes = [];
    for (const voteId of ownedVoteIds) {
        const vote = allVotes[voteId.member];
        if (vote) {
            const parsedVote = JSON.parse(vote) as unknown;
            if (isSnooVote(parsedVote)) {
                ownedVotes.push(parsedVote);
            }
        }
    }
    return ownedVotes;
}

export async function getQueuedPreviews (redis: RedisClient): Promise<string[]> {
    const zRangeResult = await redis.zRange(previewUpdateQueue, 0, -1);
    return zRangeResult.map(result => result.member);
}

export async function queuePreview (redis: RedisClient, postId: string) {
    await redis.zAdd(previewUpdateQueue, {member: postId, score: Date.now()});
}

export async function unqueuePreview (redis: RedisClient, postId: string) {
    await redis.zRem(previewUpdateQueue, [postId]);
}
