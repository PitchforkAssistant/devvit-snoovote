import {Devvit} from "@devvit/public-api";

Devvit.configure({
    redditAPI: true,
    redis: true,
    media: true,
    realtime: true,
});

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

// Jobs
export {previewUpdaterJob} from "./scheduler/previewUpdaterJob.js";
export {forceRefresherJob} from "./scheduler/forceRefresherJob.js";

export default Devvit;

