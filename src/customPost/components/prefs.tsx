import {Devvit} from "@devvit/public-api";

export type PrefsProps = {
    showInactives: boolean;
    onInactivesToggle: () => void;
};

export const Prefs = ({showInactives, onInactivesToggle}: PrefsProps) => (
    <vstack alignment="center top" width="100%" height="100%">
        <vstack alignment="center middle" grow width="100%" height="100%">
            <spacer size="xsmall" grow/>
        </vstack>
        <hstack padding="medium" alignment="center middle" minWidth="100%">
            <spacer size="xsmall" grow/>
            <vstack backgroundColor="rgba(0,0,0,0.5)" cornerRadius="full" padding="xsmall">
                <button icon={showInactives ? "show" : "hide"} size="small" onPress={onInactivesToggle}/>
            </vstack>
        </hstack>
    </vstack>
);

