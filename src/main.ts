import {Devvit} from "@devvit/public-api";

Devvit.configure({
    redditAPI: true,
    redis: true,
    media: true,
    realtime: true,
});

Devvit.debug.emitSnapshots = true;
Devvit.debug.emitState = true;

// Settings
export {devvitAppSettings} from "./settings.js";

// Forms
export {createPostForm} from "./forms/createPostForm.js";

// Buttons
export {createPostButton} from "./buttons/createPostButton.js";

// Custom Post
export {snooVotePost} from "./customPost/index.js";

// Triggers
export {appInstallTrigger} from "./triggers/appInstall.js";
export {appUpgradeTrigger} from "./triggers/appUpgrade.js";

export default Devvit;

