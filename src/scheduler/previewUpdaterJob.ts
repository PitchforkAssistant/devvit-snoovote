import {TriggerContext, ScheduledJobEvent, Devvit} from "@devvit/public-api";
import {getPostSnooVote, getQueuedPreviews, unqueuePreview} from "../utils/snooVote.js";
import {BasicPreview} from "../customPost/components/basicPreview.js";
import {advancedPreviewMaker} from "../customPost/components/advancedPreview.js";

export async function onPreviewUpdaterJob (event: ScheduledJobEvent<undefined>, context: TriggerContext) {
    console.log(`onPreviewUpdaterJob\nevent:\n${JSON.stringify(event)}\ncontext:\n${JSON.stringify(context)}`);
    const postIds = await getQueuedPreviews(context.redis);

    for (const postId of postIds) {
        try {
            const post = await context.reddit.getPostById(postId);

            const currentVote = await getPostSnooVote(context.redis, postId);
            if (!currentVote) {
                await post.setCustomPostPreview(() => BasicPreview);
            } else {
                await post.setCustomPostPreview(() => advancedPreviewMaker({
                    vote: currentVote,
                    uiDims: {width: 512, height: 512, scale: 3.5},
                    getVotes: (choiceId: string) => currentVote.result?.votes[choiceId],
                }));
            }
            console.log(`Updated preview for post ${postId}`);
            await unqueuePreview(context.redis, postId);
        } catch (e) {
            console.error(`Error updating preview for post ${postId}: ${String(e)}`);
        }
    }
}

export const previewUpdaterJob = Devvit.addSchedulerJob({
    name: "previewUpdaterJob",
    onRun: onPreviewUpdaterJob,
});
