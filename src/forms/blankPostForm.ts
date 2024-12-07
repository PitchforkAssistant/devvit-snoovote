import {Context, Devvit, Form, FormKey, FormOnSubmitEvent, FormOnSubmitEventHandler} from "@devvit/public-api";
import {BasicPreview} from "../customPost/components/basicPreview.js";

const form: Form = {
    fields: [
        {
            type: "string",
            name: "title",
            label: "Post Title",
            helpText: "This will be the title of the post and cannot be changed after submission.",
        },
    ],
    title: "Create Blank Vote Post",
    description: "Create a vote post without first creating an associated poll. Moderators can edit the active poll of a vote through the post.",
    acceptLabel: "Submit",
    cancelLabel: "Cancel",
};

export type CreatePostBlankFormSubmitData = {
    title?: string;
}

const formHandler: FormOnSubmitEventHandler<CreatePostBlankFormSubmitData> = async (event: FormOnSubmitEvent<CreatePostBlankFormSubmitData>, context: Context) => {
    const message = `You submitted the form with values ${JSON.stringify(event.values)}`;
    console.log(message);
    context.ui.showToast(message);

    // The logic for creating a custom post.
    const subredditName = (await context.reddit.getCurrentSubreddit()).name;

    const title = event.values.title ??= "Custom Post";

    try {
        const newPost = await context.reddit.submitPost({
            title,
            subredditName,
            preview: BasicPreview,
            textFallback: {text: "The platform you're using doesn't support custom posts. Please use Shreddit or an up to date app to view this post."},
        });
        context.ui.showToast({
            text: "Custom post created, redirecting...",
            appearance: "success",
        });
        context.ui.navigateTo(newPost);
    } catch (e) {
        console.error("Error creating custom post", e);
        context.ui.showToast(`Failed to create custom post: ${String(e)}`);
    }
};

export const blankPostForm: FormKey = Devvit.createForm(form, formHandler);
