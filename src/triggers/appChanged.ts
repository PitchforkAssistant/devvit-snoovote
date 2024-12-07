import {AppInstall, AppUpgrade} from "@devvit/protos";
import {TriggerContext} from "@devvit/public-api";
import {startSingletonJob} from "devvit-helpers";

export async function onAppChanged (event: AppInstall | AppUpgrade, context: TriggerContext) {
    console.log(`onAppChanged\nevent:\n${JSON.stringify(event)}\ncontext:\n${JSON.stringify(context)}`);
    await startSingletonJob(context.scheduler, "previewUpdaterJob", "* * * * *");
    await startSingletonJob(context.scheduler, "forceRefresherJob", "* * * * * *");
}
