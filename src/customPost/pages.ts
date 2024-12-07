import {HelpPage} from "./pages/help/helpPage.js";
import {SnoosPage} from "./pages/snoos/snoosPage.js";
import {CustomPostState} from "./postState.js";
import {SnooPageState} from "./pages/snoos/snoosState.js";
import {ManagerPage} from "./pages/manager/managerPage.js";
import {ManagerPageState} from "./pages/manager/managerState.js";
import {HelpPageState} from "./pages/help/helpState.js";

export type PageName = "snoos" | "help" | "manager";

export type PageList = {
    [key in PageName]: (state: CustomPostState) => JSX.Element;
};

export const Pages: PageList = {
    snoos: SnoosPage,
    help: HelpPage,
    manager: ManagerPage,
};

export interface PageProps {
    state: CustomPostState;
}

export const Page = ({state}: PageProps) => Pages[state.currentPage](state);

export const PageStateTypes = {
    snoos: SnooPageState,
    manager: ManagerPageState,
    help: HelpPageState,
};

export type PageStateList = {
    [key in PageName]: typeof PageStateTypes[key] extends new (state: CustomPostState) => unknown ? InstanceType<typeof PageStateTypes[key]> : undefined;
}
