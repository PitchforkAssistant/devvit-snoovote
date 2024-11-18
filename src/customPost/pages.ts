import {HelpPage} from "./pages/help.js";
import {SnoosPage} from "./pages/snoos.js";
import {CustomPostState} from "./postState.js";
import {SnooPageState} from "./snooManager.js";

export type PageName = "snoos" | "help";

export type PageList = {
    [key in PageName]: (state: CustomPostState) => JSX.Element;
};

export const Pages: PageList = {
    snoos: SnoosPage,
    help: HelpPage,
};

export interface PageProps {
    state: CustomPostState;
}

export const Page = ({state}: PageProps) => Pages[state.currentPage](state);

export const PageStateTypes = {
    snoos: SnooPageState,
    help: undefined,
};

export type PageStateList = {
    [key in PageName]: typeof PageStateTypes[key] extends new (state: CustomPostState) => unknown ? InstanceType<typeof PageStateTypes[key]> : undefined;
}
