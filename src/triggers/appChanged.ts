import {AppInstall, AppUpgrade} from "@devvit/protos";
import {TriggerContext} from "@devvit/public-api";

export async function onAppChanged (event: AppInstall | AppUpgrade, context: TriggerContext) {
    console.log(`onAppChanged\nevent:\n${JSON.stringify(event)}\ncontext:\n${JSON.stringify(context)}`);
}
