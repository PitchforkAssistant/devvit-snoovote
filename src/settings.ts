import {Devvit} from "@devvit/public-api";

// Set up the configuration field presented to the user for each installation (subreddit) of the app.
export const devvitAppSettings = Devvit.addSettings([
    {
        type: "boolean",
        name: "toggle",
        label: "Test",
        helpText: "Test",
        defaultValue: false,
    },
]);
