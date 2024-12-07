import {Context, FormKey, useForm} from "@devvit/public-api";

import {CustomPostState} from "../../postState.js";
import {getAllSnooVotes, getSnooVote, isSnooVote, queuePreview, setPostSnooVote, updateSnooVote} from "../../../utils/snooVote.js";
import {resetPersistentSnoos} from "../../../utils/snooWorld.js";
import {resetConfirmForm, ResetConfirmFormSubmitData} from "../../../forms/resetConfirmForm.js";
import {editVoteForm, EditVoteFormSubmitData} from "../../../forms/editVoteForm.js";
import {changeVoteForm, ChangeVoteFormSubmitData} from "../../../forms/changeVoteForm.js";

export class ManagerPageState {
    public context: Context;
    readonly changeVoteFormKey: FormKey;
    readonly editRawVoteFormKey: FormKey;
    readonly resetFormKey: FormKey;

    constructor (readonly postState: CustomPostState) {
        this.context = postState.context;
        this.changeVoteFormKey = useForm(changeVoteForm, this.changeVoteSubmit);
        this.editRawVoteFormKey = useForm(editVoteForm, this.editRawVoteSubmit);
        this.resetFormKey = useForm(resetConfirmForm, this.resetConfirmSubmit);
    }

    get snoosState () {
        return this.postState.PageStates.snoos;
    }

    get currentVote () {
        return this.snoosState.currentVote;
    }

    get isFrozen () {
        return this.snoosState.currentVote?.frozen ?? false;
    }

    observerPressed = async () => {
        this.snoosState.isObserver = true;
        this.context.ui.showToast("Entered observer mode! Refresh to return to normal.");
        this.postState.changePage("snoos");
    };

    changeVotePressed = async () => {
        if (!this.context.userId) {
            this.context.ui.showToast("ERROR: No user ID");
            return;
        }

        // Get all the votes
        const votes = this.postState.isModerator ? await getAllSnooVotes(this.context.redis) : await getAllSnooVotes(this.context.redis, this.context.userId);
        this.context.ui.showForm(this.changeVoteFormKey, {
            currentVote: this.currentVote?.id ?? "",
            votes,
        });
    };

    changeVoteSubmit = async (data: ChangeVoteFormSubmitData) => {
        const newVoteId = data.vote?.[0];
        if (!newVoteId) {
            this.context.ui.showToast("Unable to change vote, no vote ID provided!");
            return;
        }

        if (newVoteId === this.currentVote?.id) {
            this.context.ui.showToast("Vote is already set to that ID!");
            return;
        }

        if (!this.context.postId) {
            this.context.ui.showToast("No post ID found!");
            return;
        }

        const newVote = await getSnooVote(this.context.redis, newVoteId);
        if (!newVote) {
            this.context.ui.showToast("Failed to get selected vote!");
            return;
        }

        await setPostSnooVote(this.context.redis, this.context.postId, newVoteId);
        this.snoosState.currentVote = newVote;
        await this.snoosState.sendToChannel({
            type: "vote",
            data: newVote,
        });
        this.context.ui.showToast("Vote changed!");
    };

    toggleFrozenPressed = async () => {
        const isFrozen = !this.isFrozen; // Toggle the current frozen state
        if (!this.currentVote) {
            this.context.ui.showToast("No current vote to freeze/unfreeze!");
            return;
        }

        if (!this.context.postId) {
            this.context.ui.showToast("No post ID found!");
            return;
        }

        const updatedVote = {...this.currentVote};
        updatedVote.frozen = isFrozen;
        try {
            const voteIds = this.currentVote.choices.map(choice => choice.id); // Get all the vote IDs

            // TODO: Possibly deal with ties
            // Get the counts and the highest vote for each
            const votes: Record<string, number> = {};
            let highestVote = 0;
            let highestVoteId = "";
            for (const voteId of voteIds) {
                const voteCount = this.snoosState.getVotes(voteId);
                votes[voteId] = voteCount ?? 0;
                if (voteCount && voteCount > highestVote) {
                    highestVote = voteCount;
                    highestVoteId = voteId;
                }
            }

            updatedVote.result = {
                winnerId: highestVoteId,
                time: Date.now(),
                votes,
            };

            // Send the updated vote to the channel, but also set our local state because we ignore messages from ourselves
            this.snoosState.currentVote = updatedVote;
            await this.snoosState.sendToChannel({
                type: "vote",
                data: updatedVote,
            });
            // Also force an update of the ghost world
            await this.snoosState.sendToChannel({
                type: "refresh",
                data: Date.now(),
            });
            await updateSnooVote(this.context.redis, updatedVote);
            await queuePreview(this.context.redis, this.context.postId);

            this.context.ui.showToast(`Vote set to ${isFrozen ? "frozen" : "unfrozen"}`);
        } catch (e) {
            this.context.ui.showToast(`Failed to freeze/unfreeze vote: ${String(e)}`);
        }
    };

    sendRefreshPressed = async () => {
        this.snoosState.refresher = Date.now();
        await this.snoosState.sendToChannel({
            type: "refresh",
            data: Date.now(),
        });
        this.context.ui.showToast("Refresh sent!");
    };

    updatePreviewPressed = async () => {
        if (!this.context.postId) {
            this.context.ui.showToast("No post ID found!");
            return;
        }
        await queuePreview(this.context.redis, this.context.postId);
        this.context.ui.showToast("Preview update queued!");
    };

    editRawVotePressed = async () => {
        this.context.ui.showForm(this.editRawVoteFormKey, {
            defaultValues: {
                rawVote: JSON.stringify(this.currentVote, null, 2),
            },
        });
    };

    editRawVoteSubmit = async (data: EditVoteFormSubmitData) => {
        const rawVoteString = data.rawVote;
        if (!rawVoteString) {
            this.context.ui.showToast("No raw vote data provided!");
            return;
        }

        if (!this.context.postId) {
            this.context.ui.showToast("No post ID found!");
            return;
        }

        try {
            const rawVote = JSON.parse(rawVoteString) as unknown;
            if (!rawVote) {
                throw new Error("Failed to parse vote data!");
            }

            if (!isSnooVote(rawVote)) {
                throw new Error("Failed to validate vote data against schema!");
            }

            await updateSnooVote(this.context.redis, rawVote);
            await queuePreview(this.context.redis, this.context.postId);
            this.snoosState.currentVote = rawVote;
            await this.snoosState.sendToChannel({
                type: "vote",
                data: rawVote,
            });
            this.context.ui.showToast("Vote updated!");
        } catch (e) {
            this.context.ui.showToast(`Failed to update vote: ${String(e)}`);
            this.context.ui.showForm(this.editRawVoteFormKey, {defaultValues: {rawVote: rawVoteString}});
        }
    };

    resetVotePressed = async () => {
        this.context.ui.showForm(this.resetFormKey);
    };

    resetConfirmSubmit = async (data: ResetConfirmFormSubmitData) => {
        if (!data.confirm) {
            this.context.ui.showToast("Confirm set to false, reset cancelled!");
            return;
        }

        if (!this.currentVote?.id) {
            this.context.ui.showToast("No current vote to reset!");
            return;
        }

        try {
            await resetPersistentSnoos(this.context.redis, this.currentVote.id);

            this.context.ui.showToast("Persistent snoos reset!");
            this.snoosState.refresher = Date.now();
            await this.snoosState.sendToChannel({
                type: "refresh",
                data: Date.now(),
            });
        } catch (e) {
            this.context.ui.showToast(`Failed to reset vote: ${String(e)}`);
        }
    };
}
