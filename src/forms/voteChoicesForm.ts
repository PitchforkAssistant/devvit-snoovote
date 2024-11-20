import {Context, Devvit, Form, FormFunction, FormKey, FormOnSubmitEvent, FormOnSubmitEventHandler} from "@devvit/public-api";
import {voteOptionsForm as voteOptionsFormKey, votePostForm} from "../main.js";

import {toNumberOrDefault} from "devvit-helpers";
import {isHexColor} from "../utils/dualColor.js";
import {getSnooVoteInitialData, setSnooVoteDraftChoice} from "../utils/snooVoteDraft.js";

type CreateVoteChoicesFormSubmitData = {
    choice?: 1 | 2 | 3 | 4;
    choiceTitle?: string;
    textColorLight?: string;
    textColorDark?: string;
    bgColorLight?: string;
    bgColorDark?: string;
    bgImage?: string;
    bgImageMode?: [Devvit.Blocks.ImageResizeMode]
}

type CreateVoteChoicesForm = {
    choiceNum?: 1 | 2 | 3 | 4;
    defaultValues?: CreateVoteChoicesFormSubmitData;
}

const form: FormFunction<CreateVoteChoicesForm> = (data: CreateVoteChoicesForm): Form => {
    const choiceNum = toNumberOrDefault(data.choiceNum, 1);
    if (choiceNum < 1 || choiceNum > 4) {
        throw new Error("Invalid choice number!");
    }
    return {
        fields: [
            {
                type: "number",
                name: "choice",
                label: "Choice Number",
                defaultValue: data.choiceNum ?? 1,
                disabled: true,
            },
            {
                type: "string",
                name: "choiceTitle",
                label: "Choice Title",
                helpText: "This will be displayed as the text for this choice in the vote post.",
                placeholder: "Banana",
                required: true,
            },
            {
                type: "group",
                label: "Choice Image",
                helpText: "Customize the image for this choice. If you don't upload an image, it will just use the background color.",
                fields: [{
                    type: "image",
                    name: "bgImage",
                    label: "Background Image",
                    helpText: "This will be used as the image for this choice.",
                    required: false,
                },
                {
                    type: "select",
                    name: "bgImageMode",
                    label: "Background Image Mode",
                    helpText: "Choose how the image will be resized to fit the choice area.",
                    options: [
                        {label: "None", value: "none"},
                        {label: "Fit", value: "fit"},
                        {label: "Fill", value: "fill"},
                        {label: "Cover", value: "cover"},
                        {label: "Scale Down", value: "scale-down"},
                    ],
                    defaultValue: data.defaultValues?.bgImageMode ?? ["none"],
                    required: false,
                }],
            },
            {
                type: "group",
                label: "Choice Colors",
                helpText: "Customize the colors for this choice. These will be used to style the area of this choice. Please enter colors in a hex format, e.g. #ff0000 or #ff11ee99.",
                fields: [
                    {
                        type: "group",
                        label: "Text Color",
                        helpText: "This will be the text color of the title of this choice.",
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
                        helpText: "This will be used as the background color of the area of this choice. Depending on the background image, this may be covered.",
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
        title: `Create Snoo Vote Post - Choice ${data.choiceNum ?? 1}`,
        description: `Define choice ${data.choiceNum ?? 1} for your Snoo Vote.`,
        acceptLabel: "Continue",
        cancelLabel: "Cancel",
    };
};

const formHandler: FormOnSubmitEventHandler<CreateVoteChoicesFormSubmitData> = async (event: FormOnSubmitEvent<CreateVoteChoicesFormSubmitData>, context: Context) => {
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

    if (!event.values.choiceTitle) {
        context.ui.showToast("You must provide a choice title.");
        fail = true;
    }

    if (event.values.choice !== 1 && event.values.choice !== 2 && event.values.choice !== 3 && event.values.choice !== 4) {
        context.ui.showToast("Invalid choice number, how did this happen? Please retry.");
        fail = true;
    }

    // Early returns and early form shows seem to behave oddly here. Using a variable to track failure is a workaround.
    // Without this (i.e. showForm inside each if block), the form will show the error message and then show the next form instead of showing the same form again.
    if (fail) {
        context.ui.showForm(voteOptionsFormKey, {choiceNum: event.values.choice ?? 1, defaultValues: event.values});
    } else {
        await setSnooVoteDraftChoice(context.redis, context.userId, event.values.choice ?? 1, {
            id: Math.random().toString(36).substring(2),
            text: event.values.choiceTitle as string,
            backgroundColor: {
                light: event.values.bgColorLight as string,
                dark: event.values.bgColorDark as string,
            },
            textColor: {
                light: event.values.textColorLight as string,
                dark: event.values.textColorDark as string,
            },
            backgroundImage: event.values.bgImage ? {
                url: event.values.bgImage,
                mode: event.values.bgImageMode?.[0] ?? "none",
            } : undefined,
        });

        const initialVoteData = await getSnooVoteInitialData(context.redis, context.userId);
        if (!initialVoteData) {
            context.ui.showToast("Failed to get initial vote data, please retry.");
            return;
        }

        if (initialVoteData.choices === event.values.choice) {
        // All choices have been defined, move to the post creation form.
            context.ui.showForm(votePostForm);
            return;
        } else {
        // Move to the next choice form.
            context.ui.showForm(voteOptionsFormKey, {choiceNum: (event.values.choice ?? 1) + 1});
        }
    }
};

export const voteOptionsForm: FormKey = Devvit.createForm(form, formHandler);
