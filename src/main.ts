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
export {blankPostForm} from "./forms/blankPostForm.js";
export {voteInitialForm} from "./forms/voteInitialForm.js";
export {voteOptionsForm} from "./forms/voteChoicesForm.js";
export {votePostForm} from "./forms/votePostForm.js";

// Buttons
export {blankPostButton} from "./buttons/blankPostButton.js";
export {votePostButton} from "./buttons/votePostButton.js";

// Custom Post
export {snooVotePost} from "./customPost/index.js";

// Triggers
export {appInstallTrigger} from "./triggers/appInstall.js";
export {appUpgradeTrigger} from "./triggers/appUpgrade.js";

export default Devvit;

