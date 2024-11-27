
import {Devvit} from "@devvit/public-api";
import {Area, Coords} from "../../utils/coords.js";

export type ControlsProps = {
    pos: Coords;
    step: Coords;
    bounds: Area;
    disabled: boolean;
    isManager: boolean;
    onPress: (movement: {x: number, y: number, z: number}) => Promise<void>;
};

export const Controls = ({pos, step, bounds, disabled, isManager, onPress}: ControlsProps) => (
    <vstack alignment="bottom start" width="100%" height="100%" grow>
        <hstack padding="medium" gap="large" alignment="center middle">
            <vstack alignment="center" backgroundColor="rgba(0,0,0,0.5)" cornerRadius="full" padding="small">
                <button disabled={disabled || pos.y <= bounds.min.y} onPress={() => onPress({x: 0, y: -step.y, z: 0})} size="small" icon="up-fill"/>
                <hstack gap={isManager ? "none" : "large"}>
                    <button disabled={disabled || pos.x <= bounds.min.x} onPress={() => onPress({x: -step.x, y: 0, z: 0})} size="small" icon="left-fill"/>
                    {isManager
                        ? pos.z === 0
                            ? <button disabled={disabled} onPress={() => onPress({x: 0, y: 0, z: 1})} size="small" icon="expand-left-fill"/> :
                            <button disabled={disabled} onPress={() => onPress({x: 0, y: 0, z: -1})} size="small" icon="collapse-left-fill"/>
                        : ""}
                    <button disabled={disabled || pos.x >= bounds.max.x} onPress={() => onPress({x: step.x, y: 0, z: 0})} size="small" icon="right-fill"/>
                </hstack>
                <button disabled={disabled || pos.y >= bounds.max.y} onPress={() => onPress({x: 0, y: step.y, z: 0})} size="small" icon="down-fill"/>
            </vstack>
        </hstack>
    </vstack>
);

