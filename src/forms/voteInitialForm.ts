import {Context, Devvit, Form, FormFunction, FormKey, FormOnSubmitEvent, FormOnSubmitEventHandler} from "@devvit/public-api";
import {voteInitialForm as voteInitialFormKey, voteOptionsForm} from "../main.js";
import {initSnooVoteDraft} from "../utils/snooVoteDraft.js";
import {isHexColor} from "../utils/dualColor.js";

type CreateVoteInitialFormSubmitData = {
    voteName?: string;
    voteTitle?: string;
    numChoices?: ["2"] | ["3"] | ["4"];
    textColorLight?: string;
    textColorDark?: string;
    bgColorLight?: string;
    bgColorDark?: string;
}

type CreateVoteInitialData = {
    defaultValues?: CreateVoteInitialFormSubmitData;
}

const form: FormFunction<CreateVoteInitialData> = (data: CreateVoteInitialData): Form => ({
    fields: [
        {
            type: "string",
            name: "voteName",
            label: "Vote Name",
            helpText: "This will be used to identify your vote in the future. It will not be shown to users.",
            placeholder: "my snoo vote",
            defaultValue: data.defaultValues?.voteName,
            required: true,
        },
        {
            type: "string",
            name: "voteTitle",
            label: "Vote Title",
            helpText: "This will be the displayed in the post as your vote's title or question, choose it wisely.",
            placeholder: "This or that?",
            defaultValue: data.defaultValues?.voteTitle,
            required: true,
        },
        {
            type: "select",
            name: "numChoices",
            label: "Number of Choices",
            helpText: "Choose the number of choices for your vote.",
            options: [
                {label: "2", value: "2"},
                {label: "3", value: "3"},
                {label: "4", value: "4"},
            ],
            defaultValue: data.defaultValues?.numChoices,
        },
        {
            type: "group",
            label: "Vote Colors",
            helpText: "Customize the colors for your vote. These will be used to style the vote post. Please enter colors in a hex format, e.g. #ff0000 or #ff11ee99.",
            fields: [
                {
                    type: "group",
                    label: "Text Color",
                    helpText: "This will be the text color of the title of the vote.",
                    fields: [
                        {
                            type: "string",
                            name: "textColorLight",
                            label: "Text Color (Light Mode)",
                            placeholder: "#000000ff",
                            defaultValue: data.defaultValues?.textColorLight ?? "#000000ff",
                            required: true,
                        },
                        {
                            type: "string",
                            name: "textColorDark",
                            label: "Text Color (Dark Mode)",
                            placeholder: "#ffffffff",
                            defaultValue: data.defaultValues?.textColorDark ?? "#ffffffff",
                            required: true,
                        },
                    ],
                },
                {
                    type: "group",
                    label: "Background Color",
                    helpText: "This will be used as the background color of the post. Depending on your vote choices, it may end up covered.",
                    fields: [
                        {
                            type: "string",
                            name: "bgColorLight",
                            label: "Background Color (Light Mode)",
                            placeholder: "#ffffff00",
                            defaultValue: data.defaultValues?.textColorLight ?? "#ffffff00",
                            required: true,
                        },
                        {
                            type: "string",
                            name: "bgColorDark",
                            label: "Background Color (Dark Mode)",
                            placeholder: "#00000000",
                            defaultValue: data.defaultValues?.textColorDark ?? "#00000000",
                            required: true,
                        },
                    ],
                },
            ],
        },
    ],
    title: "Create Snoo Vote Post",
    description: "This is the first step in creating a Snoo Vote post. You will define the basic information for your vote. The choices will be defined in the next steps.",
    acceptLabel: "Continue",
    cancelLabel: "Cancel",
});

const formHandler: FormOnSubmitEventHandler<CreateVoteInitialFormSubmitData> = async (event: FormOnSubmitEvent<CreateVoteInitialFormSubmitData>, context: Context) => {
    console.log(event.values);
    if (!context.userId) {
        context.ui.showToast("You must be logged in to use this form.");
        return;
    }

    let fail = false;
    [event.values.textColorLight, event.values.textColorDark, event.values.bgColorLight, event.values.bgColorDark].forEach(color => {
        if (!color || !isHexColor(color)) {
            context.ui.showToast("All hex color codes must start with a # and consist of 3, 6, or 8 hexadecimals digits.");
            fail = true;
        }
    });

    if (!event.values.voteName || !event.values.voteTitle) {
        context.ui.showToast("You must provide a vote name and title.");
        fail = true;
    }

    const numChoices = Number(event.values.numChoices?.[0]);
    if (Number.isNaN(numChoices) || numChoices < 2 || numChoices > 4) {
        context.ui.showToast("You must choose the number of choices for your vote.");
        fail = true;
    }

    // Early returns and early form shows seem to behave oddly here. Using a variable to track failure is a workaround.
    // Without this (i.e. showForm inside each if block), the form will show the error message and then show the next form instead of showing the same form again.
    if (fail) {
        context.ui.showForm(voteInitialFormKey, {defaultValues: event.values});
        return;
    } else {
        await initSnooVoteDraft(context.redis, context.userId, {
            id: Math.random().toString(36).substring(2),
            name: event.values.voteName as string,
            text: event.values.voteTitle as string,
            backgroundColor: {
                light: event.values.bgColorLight as string,
                dark: event.values.bgColorDark as string,
            },
            textColor: {
                light: event.values.textColorLight as string,
                dark: event.values.textColorDark as string,
            },
            choices: numChoices as 2 | 3 | 4,
        });
        context.ui.showForm(voteOptionsForm, {choiceNum: 1});
    }
};

export const voteInitialForm: FormKey = Devvit.createForm(form, formHandler);
