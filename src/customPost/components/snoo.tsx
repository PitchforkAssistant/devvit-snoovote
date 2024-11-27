import {UIDimensions} from "@devvit/protos";
import {WorldBounds} from "../pages/snoos/snoosState.js";
import {Devvit} from "@devvit/public-api";
import {clamp} from "../../utils/clamp.js";
import {SnoovatarData} from "../../utils/snoovatar.js";

export type SnooProps = {
    snoo: SnoovatarData;
    scale: number;
    uiDims?: UIDimensions;
};

export const Snoo = (props: SnooProps) => {
    const size = Math.floor(props.uiDims ? props.uiDims.width / 5 : 75) * (props.scale + 1);
    const topOffset: Devvit.Blocks.SizeString =
        props.uiDims
            ? `${props.snoo.position.y / WorldBounds.max.y * (props.uiDims.height - size)}px`
            : `${clamp(props.snoo.position.y - 20, 0, 100)}%`;
    const leftOffset: Devvit.Blocks.SizeString =
        props.uiDims
            ? `${props.snoo.position.x / WorldBounds.max.x * (props.uiDims.width - size)}px`
            : `${clamp(props.snoo.position.x - 20, 0, 100)}%`;
    return (
        <vstack key={props.snoo.id} alignment="top start" height="100%" width="100%" maxHeight="100%" grow>
            <vstack alignment="top start" height={topOffset}>
                <spacer size="xsmall" grow/>
            </vstack>
            <hstack alignment="top start" height="100%" width="100%" maxWidth="100%" grow>
                <hstack alignment="top start" width={leftOffset}>
                    <spacer size="xsmall" grow/>
                </hstack>
                <vstack gap="none" alignment="center middle">
                    <image url={props.snoo.snoovatar} imageHeight={size} imageWidth={size}/>;
                    <vstack alignment="center" backgroundColor="rgba(0,0,0,0.5)" cornerRadius="full" padding="xsmall" >
                        {props.snoo.username ? <text selectable={false} size="xsmall">&nbsp; {props.snoo.username} &nbsp;</text> : <icon name="load" size="xsmall"/>}
                    </vstack>
                </vstack>
            </hstack>
        </vstack>
    );
};

