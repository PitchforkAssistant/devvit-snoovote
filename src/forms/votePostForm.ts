import {Context, Devvit, Form, FormFunction, FormKey, FormOnSubmitEvent, FormOnSubmitEventHandler} from "@devvit/public-api";
import {getSnooVoteDraft} from "../utils/snooVoteDraft.js";
import {setPostSnooVote, storeSnooVote} from "../utils/snooVote.js";
import {votePostForm as votePostFormKey} from "../main.js";
import {BasicPreview} from "../customPost/components/basicPreview.js";

type VotePostFormSubmitData = {
    postTitle?: string;
    submitPost?: boolean;
}

type VotePostFormData = {
    defaultValues?: VotePostFormSubmitData
}

const form: FormFunction<VotePostFormData> = (data: VotePostFormData): Form => ({
    fields: [
        {
            type: "boolean",
            name: "submitPost",
            label: "Create Post",
            helpText: "If you disable this, the vote you specified will be saved, but no post will be created. You can change an existing vote post to this vote later.",
            defaultValue: true,
        },
        {
            type: "string",
            name: "postTitle",
            label: "Post Title",
            helpText: "This will be the title of the post and cannot be changed after submission.",
            defaultValue: data.defaultValues?.postTitle,
            required: true,
        },
    ],
    title: "Create Snoo Vote Post - Post Title",
    description: "This is the last step in creating a Snoo Vote post. You just have to give your post a title and submit it.",
    acceptLabel: "Submit",
    cancelLabel: "Cancel",
});

const formHandler: FormOnSubmitEventHandler<VotePostFormSubmitData> = async (event: FormOnSubmitEvent<VotePostFormSubmitData>, context: Context) => {
    console.log(event.values);
    if (!context.userId) {
        context.ui.showToast("You must be logged in to use this form.");
        return;
    }

    if (!event.values.postTitle && event.values.submitPost) {
        context.ui.showToast("You must provide a title for your post.");
        context.ui.showForm(votePostFormKey, {defaultValues: event.values});
        return;
    } else {
        try {
            const draft = await getSnooVoteDraft(context.redis, context.userId);
            await storeSnooVote(context.redis, context.userId, draft);
            if (event.values.submitPost) {
                const newPost = await context.reddit.submitPost({
                    title: event.values.postTitle as string,
                    subredditName: (await context.reddit.getCurrentSubreddit()).name,
                    preview: BasicPreview,
                    textFallback: {text: "The platform you're using doesn't support custom posts. Please use Shreddit or an up to date app to view this post."},
                });
                await setPostSnooVote(context.redis, newPost.id, draft.id);
                context.ui.showToast({
                    text: "Snoo vote post created, redirecting...",
                    appearance: "success",
                });
                context.ui.navigateTo(newPost);
            }
        } catch (e) {
            console.error("Error storing vote draft", e);
            context.ui.showToast(`Failed to store vote draft: ${String(e)}`);
            context.ui.showForm(votePostFormKey, {defaultValues: event.values});
            return;
        }
    }
};

export const votePostForm: FormKey = Devvit.createForm(form, formHandler);
