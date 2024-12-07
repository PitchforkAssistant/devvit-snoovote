import {AppInstall} from "@devvit/protos";
import {Devvit, TriggerContext} from "@devvit/public-api";
import {onAppChanged} from "./appChanged.js";

export async function onAppInstall (event: AppInstall, context: TriggerContext) {
    await onAppChanged(event, context);
}

export const appInstallTrigger = Devvit.addTrigger({
    event: "AppInstall",
    onEvent: onAppInstall,
});
