import {Form} from "@devvit/public-api";

export const resetConfirmForm: Form = {
    title: "Reset Vote",
    description: "Are you sure you want to reset the current vote?",
    acceptLabel: "Reset",
    cancelLabel: "Cancel",
    fields: [
        {
            type: "boolean",
            name: "confirm",
            label: "Confirm Reset",
            helpText: "Submitting this form will reset all currently stored votes for the current vote.",
            defaultValue: false,
        },
    ],
};

export type ResetConfirmFormSubmitData = {
    confirm?: boolean;
};
