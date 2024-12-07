import {Context, useAsync, UseAsyncResult} from "@devvit/public-api";

import {CustomPostState} from "../../postState.js";
import {defaultAppSettings} from "../../../settings.js";

export class HelpPageState {
    public context: Context;
    readonly _discordUrl: UseAsyncResult<string>;
    readonly _moreUrl: UseAsyncResult<string>;

    constructor (readonly postState: CustomPostState) {
        this.context = postState.context;

        this._discordUrl = useAsync(async () => await this.context.settings.get<string>("discordUrl") ?? defaultAppSettings.discordUrl);
        this._moreUrl = useAsync(async () => await this.context.settings.get<string>("moreUrl") ?? defaultAppSettings.moreUrl);
    }

    get discordUrl (): string {
        return this._discordUrl.data ?? defaultAppSettings.discordUrl;
    }

    get moreUrl (): string {
        return this._moreUrl.data ?? defaultAppSettings.moreUrl;
    }

    async discordPressed () {
        this.context.ui.navigateTo(this.discordUrl);
    }

    async morePressed () {
        this.context.ui.navigateTo(this.moreUrl);
    }
}
