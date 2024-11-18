import {Context} from "@devvit/public-api";

import {CustomPostState} from "../../postState.js";

export class ManagerPageState {
    public context: Context;

    constructor (readonly postState: CustomPostState) {
        this.context = postState.context;
    }
}
