import {Context, Devvit, MenuItemOnPressEvent} from "@devvit/public-api";
import {blankPostForm} from "../main.js";

const onPress = async (event: MenuItemOnPressEvent, context: Context) => {
    context.ui.showForm(blankPostForm);
};

export const blankPostButton = Devvit.addMenuItem({
    location: ["subreddit", "post", "comment"],
    forUserType: "moderator",
    label: "Create Blank Vote Post",
    onPress,
});

