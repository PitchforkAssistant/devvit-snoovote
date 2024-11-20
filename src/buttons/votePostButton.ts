import {Context, Devvit, MenuItemOnPressEvent} from "@devvit/public-api";
import {voteInitialForm} from "../forms/voteInitialForm.js";
import {deleteSnooVoteDraft} from "../utils/snooVoteDraft.js";

const onPress = async (event: MenuItemOnPressEvent, context: Context) => {
    const userId = context.userId;
    if (!userId) {
        context.ui.showToast("You must be logged in to create a vote post.");
        return;
    }
    await deleteSnooVoteDraft(context.redis, userId);
    context.ui.showForm(voteInitialForm);
};

export const votePostButton = Devvit.addMenuItem({
    location: "subreddit",
    label: "Create Snoo Vote Post",
    onPress,
});

