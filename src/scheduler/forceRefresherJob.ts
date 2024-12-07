import {TriggerContext, ScheduledJobEvent, Devvit} from "@devvit/public-api";
import {getAppSettings} from "../settings.js";
import {votesAssociationKey} from "../utils/snooVote.js";
import {channelPrefix, SnooPagePacket} from "../customPost/pages/snoos/snoosState.js";

export async function onForceRefresherJob (event: ScheduledJobEvent<undefined>, context: TriggerContext) {
    const appSettings = await getAppSettings(context.settings);

    if (!appSettings.forceRefreshes) {
        return;
    }

    console.log(`onForceRefresherJob\nevent:\n${JSON.stringify(event)}\ncontext:\n${JSON.stringify(context)}`);

    const lastRefresh = await context.redis.get("lastRefresh");
    if (!lastRefresh || Date.now() - Number(lastRefresh) < appSettings.forceRefreshIntevalMs) {
        return;
    }
    await context.redis.set("lastRefresh", String(Date.now()));

    const postIds = Object.keys(await context.redis.hGetAll(votesAssociationKey));
    for (const postId of postIds) {
        try {
            const packet: SnooPagePacket = {
                sessionId: "forceRefresherJob",
                userId: "t2_qikfu",
                type: "refresh",
                data: Date.now(),
            };
            await context.realtime.send(`${channelPrefix}${postId}`, packet);
        } catch (e) {
            console.error(`Error updating preview for post ${postId}: ${String(e)}`);
        }
    }
}

export const forceRefresherJob = Devvit.addSchedulerJob({
    name: "forceRefresherJob",
    onRun: onForceRefresherJob,
});
