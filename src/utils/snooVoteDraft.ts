import {RedisClient} from "@devvit/public-api";
import {isSnooVoteChoice, SnooVote, SnooVoteChoice} from "./snooVote.js";
import {isDualColor} from "./dualColor.js";

export type SnooVoteFormInitialData = Omit<SnooVote, "choices"> & {"choices": 2 | 3 | 4};

export function isSnooVoteFormInitialData (data: unknown): data is SnooVoteFormInitialData {
    if (!data || typeof data !== "object") {
        return false;
    }
    const initialData = data as SnooVoteFormInitialData;
    return typeof initialData.id === "string" &&
           typeof initialData.name === "string" &&
           typeof initialData.text === "string" &&
           isDualColor(initialData.textColor) &&
           isDualColor(initialData.backgroundColor) &&
           typeof initialData.choices === "number" && [2, 3, 4].includes(initialData.choices);
}

export async function getSnooVoteInitialData (redis: RedisClient, authorId: string): Promise<SnooVoteFormInitialData | undefined> {
    const data = await redis.hGet(`voteForm:${authorId}`, "initial");
    if (!data) {
        return undefined;
    }
    try {
        const parsedData = JSON.parse(data) as unknown;
        if (!isSnooVoteFormInitialData(parsedData)) {
            return undefined;
        }
        return parsedData;
    } catch (e) {
        console.log(`Failed to parse vote form draft for ${authorId}: ${String(e)}`);
        return undefined;
    }
}

export async function initSnooVoteDraft (redis: RedisClient, authorId: string, initialData: SnooVoteFormInitialData) {
    await redis.hSet(`voteForm:${authorId}`, {initial: JSON.stringify(initialData)});
}

export async function deleteSnooVoteDraft (redis: RedisClient, authorId: string) {
    try {
        await redis.del(`voteForm:${authorId}`);
    } catch (e) {
        console.log(`Failed to delete vote form draft for ${authorId}: ${String(e)}`);
    }
}

export async function setSnooVoteDraftChoice (redis: RedisClient, authorId: string, choice: 1 | 2 | 3 | 4, data: SnooVoteChoice) {
    await redis.hSet(`voteForm:${authorId}`, {[`choice${choice}`]: JSON.stringify(data)});
}

export async function getSnooVoteDraft (redis: RedisClient, authorId: string): Promise<SnooVote> {
    const initialData = await getSnooVoteInitialData(redis, authorId);
    if (!initialData) {
        throw new Error("Failed to get initial data for vote form draft.");
    }

    const choices: SnooVoteChoice[] = [];
    for (let i = 1; i <= initialData.choices; i++) {
        const choiceData = await redis.hGet(`voteForm:${authorId}`, `choice${i}`);
        if (!choiceData) {
            throw new Error(`Failed to get choice ${i}`);
        }
        try {
            const parsedData = JSON.parse(choiceData) as unknown;
            if (!isSnooVoteChoice(parsedData)) {
                throw new Error(`Invalid data for choice ${i}:\n${JSON.stringify(parsedData)}`);
            }
            choices.push(parsedData);
        } catch (e) {
            throw new Error(`Failed to parse choice ${i} data for vote form draft:\n${String(e)}`);
        }
    }

    if (choices.length !== initialData.choices) {
        throw new Error("Failed to get all choices for vote form draft.");
    }

    return {
        id: initialData.id,
        name: initialData.name,
        text: initialData.text,
        textColor: initialData.textColor,
        backgroundColor: initialData.backgroundColor,
        choices,
    };
}
