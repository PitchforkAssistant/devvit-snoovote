import {Form, FormFunction} from "@devvit/public-api";

export type EditVoteFormSubmitData = {
    rawVote?: string;
}

export type EditVoteFormData = {
    defaultValues?: EditVoteFormSubmitData
}

export const editVoteForm: FormFunction<EditVoteFormData> = (data: EditVoteFormData): Form => ({
    fields: [
        {
            type: "paragraph",
            name: "rawVote",
            label: "Raw Vote Data",
            helpText: "You'll want to copy the JSON provided, edit it, and paste it back in here nefore submitting.",
            defaultValue: data.defaultValues?.rawVote ?? "ERROR: No raw vote data provided.",
            lineHeight: data.defaultValues?.rawVote?.split("\n").length ?? 4,
            required: true,
        },
    ],
    title: "Edit Raw Vote Data",
    description: "This lets you directly edit the JSON of the vote data. This data is validated less thoroughly than the create vote form, so be careful.",
    acceptLabel: "Submit",
    cancelLabel: "Cancel",
});
