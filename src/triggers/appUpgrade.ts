import {AppUpgrade} from "@devvit/protos";
import {Devvit, TriggerContext} from "@devvit/public-api";
import {onAppChanged} from "./appChanged.js";

export async function onAppUpgrade (event: AppUpgrade, context: TriggerContext) {
    await onAppChanged(event, context);
}

export const appUpgradeTrigger = Devvit.addTrigger({
    event: "AppUpgrade",
    onEvent: onAppUpgrade,
});
