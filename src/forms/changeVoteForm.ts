import {Form, FormFunction} from "@devvit/public-api";
import {SnooVote} from "../utils/snooVote.js";

export type ChangeVoteFormSubmitData = {
    vote?: [string] | [];
}

export type ChangeVoteFormData = {
    currentVote?: string;
    votes?: SnooVote[];
}

export const changeVoteForm: FormFunction<ChangeVoteFormData> = (data: ChangeVoteFormData): Form => ({
    fields: [
        {
            type: "select",
            name: "vote",
            label: "Select Vote",
            options: data.votes?.map(vote => ({label: `${vote.name} (${vote.id})`, value: vote.id})) ?? [],
            defaultValue: [data.currentVote ?? ""],
            multiSelect: false,
            required: true,
        },
    ],
    title: "Change Active Vote",
    description: "This will change the currently active vote to the one you choose from the dropdown.",
    acceptLabel: "Submit",
    cancelLabel: "Cancel",
});
