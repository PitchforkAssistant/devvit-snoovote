import {RedisClient} from "@devvit/public-api";
import {isSnoovatarData, SnoovatarData} from "./snoovatar.js";

export type SnooWorld = {
    [id: string]: SnoovatarData;
}

export async function storePersistentSnoo (redis: RedisClient, voteId: string, snoo: SnoovatarData): Promise<void> {
    await redis.hSet(`snoos:${voteId}`, {[snoo.id]: JSON.stringify(snoo)});
}

export async function getPersistentSnoos (redis: RedisClient, voteId: string): Promise<SnooWorld> {
    const rawSnoos = await redis.hGetAll(`snoos:${voteId}`);
    const parsedSnoos = Object.values(rawSnoos).map((snoo): unknown => JSON.parse(snoo)).filter(isSnoovatarData);
    return parsedSnoos.reduce((snooWorld, snoo) => {
        snooWorld[snoo.id] = snoo;
        return snooWorld;
    }, {} as SnooWorld);
}

export async function resetPersistentSnoos (redis: RedisClient, voteId: string) {
    await redis.del(`snoos:${voteId}`);
}
