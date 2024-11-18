import {Context, UseChannelResult, UseIntervalResult, UseStateResult, useChannel, useInterval, useState} from "@devvit/public-api";
import {BasicUserData} from "../utils/basicData.js";
import {getPostSnooVote, SnooVote} from "../utils/snooVote.js";
import {ChannelStatus} from "@devvit/public-api/types/realtime.js";
import {getRandomSnooPosition} from "../utils/snoovatar.js";
import {clamp} from "../utils/clamp.js";
import {CustomPostState} from "./postState.js";

export type Coords = {
    x: number;
    y: number;
    z: number;
};

export type Area = {
    min: Coords;
    max: Coords;
}

export const StepSize: Coords = {x: 10, y: 10, z: 10};
export const WorldBounds: Area = {
    min: {x: 0, y: 0, z: 0},
    max: {x: 100, y: 100, z: 100},
};

export type SnoovatarData = BasicUserData & {position: Coords, lastUpdate: number};

export type SnooWorld = {
    [id: string]: SnoovatarData;
}

export type SnooVoteResult = SnooVote & {winner: string};

export type SnooPagePacket = {
    sessionId: string;
    userId: string;
} & {
    sessionId: string;
    userId: string;
    type: "position";
    data: SnoovatarData;
} | {
    sessionId: string;
    userId: string;
    type: "heartbeat";
    data: SnoovatarData;
} | {
    sessionId: string;
    userId: string;
    type: "voteChange";
    data: SnooVote;
} | {
    sessionId: string;
    userId: string;
    type: "voteResult";
    data: SnooVoteResult;
}

export class SnooPageState {
    public context: Context;
    readonly _world: UseStateResult<SnooWorld>;
    readonly _sessionId: UseStateResult<string>;
    readonly _currentUser: UseStateResult<BasicUserData | null>;
    readonly _currentVote: UseStateResult<SnooVote | SnooVoteResult | null>;
    readonly _channel: UseChannelResult<SnooPagePacket>;
    readonly _heartbeat: UseIntervalResult;

    constructor (readonly postState: CustomPostState) {
        this.context = postState.context;
        this._currentUser = useState<BasicUserData | null>(() => {
            if (postState.currentUser) {
                return postState.currentUser;
            }
            return null;
        });

        this._world = useState<SnooWorld>(() => {
            if (postState.currentUser) {
                return {
                    [postState.currentUser.id]: {
                        ...postState.currentUser,
                        position: getRandomSnooPosition(WorldBounds, StepSize),
                        lastUpdate: Date.now(),
                    },
                };
            }
            return {};
        });

        this._currentVote = useState<SnooVote | null>(async () => {
            if (this.context.postId) {
                return getPostSnooVote(this.context.redis, this.context.postId);
            }
            return null;
        });

        this._sessionId = useState<string>(Math.random().toString(36).substring(2));
        this._channel = useChannel<SnooPagePacket>({
            name: `snooPageChannel${this.context.postId}`,
            onMessage: this.onChannelMessage,
            onSubscribed: this.onChannelSubscribed,
            onUnsubscribed: this.onChannelUnsubscribed,
        });

        this._channel.subscribe();

        this._heartbeat = useInterval(this.onInterval, 1000);
    }

    get sessionId (): string {
        return this._sessionId[0];
    }

    get world (): SnooWorld {
        return this._world[0];
    }

    get status (): ChannelStatus {
        return this._channel.status;
    }

    set world (world: SnooWorld) {
        this._world[1](world);
    }

    get mySnoovatar (): SnoovatarData | null {
        if (this._currentUser[0]) {
            return this.world[this._currentUser[0].id];
        }
        return null;
    }

    get snooSize (): number {
        return this.context.dimensions ? this.context.dimensions.width / 5 : 100;
    }

    sendToChannel = async (message: SnooPagePacket) => {
        if (this._channel.status === ChannelStatus.Connected) {
            await this._channel.send(message);
        } else {
            this._channel.subscribe();
        }
    };

    sendHeartbeat = async () => {
        if (this.mySnoovatar) {
            await this.sendToChannel({
                sessionId: this.sessionId,
                userId: this.mySnoovatar.id,
                type: "heartbeat",
                data: {...this.mySnoovatar, lastUpdate: Date.now()},
            });
        }
    };

    moveSnoovatar = async (movement: Coords) => {
        const mySnoovatar = this.mySnoovatar;
        if (mySnoovatar) {
            const currentPosition = this.world[mySnoovatar.id].position;

            // Force position to be integers from 0 to 100
            const newPosition = {
                x: Math.round(clamp(currentPosition.x + movement.x, WorldBounds.min.x, WorldBounds.max.x)),
                y: Math.round(clamp(currentPosition.y + movement.y, WorldBounds.min.y, WorldBounds.max.y)),
                z: Math.round(clamp(currentPosition.z + movement.z, WorldBounds.min.z, WorldBounds.max.z)),
            };

            // Prevent moving if the new position is the same as the current position
            const distance = Math.sqrt(Math.pow(newPosition.x - currentPosition.x, 2) +
                Math.pow(newPosition.y - currentPosition.y, 2) +
                Math.pow(newPosition.z - currentPosition.z, 2),);
            if (distance < 1) {
                return;
            }

            // Note: Setting this.world and then sending this.world[mySnoovatar.id] to the channel will send the old position
            const myNewSnoovatar = {
                ...mySnoovatar,
                position: newPosition,
                lastUpdate: Date.now(),
            };

            this.world = {
                ...this.world,
                [mySnoovatar.id]: myNewSnoovatar,
            };
            await this.sendToChannel({
                sessionId: this.sessionId,
                userId: mySnoovatar.id,
                type: "position",
                data: myNewSnoovatar,
            });
        }
    };

    onPositionChange = (data: SnoovatarData) => {
        this.world = {
            ...this.world,
            [data.id]: {
                ...data,
                lastUpdate: Date.now(),
            },
        };
    };

    onChannelMessage = (message: SnooPagePacket) => {
        if (message.sessionId === this.sessionId) {
            return;
        }

        if (message.type === "position") {
            console.log(`${this.postState.currentUser?.username} got position change for ${message.userId} to ${JSON.stringify(message.data.position)}`);
            this.onPositionChange(message.data);
        }

        if (message.type === "heartbeat") {
            if (!this.world[message.userId]) {
                this.onPositionChange(message.data);
            } else {
                this.world = {
                    ...this.world,
                    [message.userId]: {
                        ...this.world[message.userId],
                        lastUpdate: Date.now(),
                    },
                };
            }
        }

        if (message.type === "voteChange" || message.type === "voteResult") {
            this._currentVote[1](message.data);
        }
    };

    onChannelSubscribed = async () => {
        this._heartbeat.start();
        if (this.mySnoovatar) {
            console.log(`${this.mySnoovatar.username} has subscribed to the ${this.context.postId} channel and environment ${JSON.stringify(this.context.uiEnvironment ?? {})}`);
            await this.sendHeartbeat();
        }
    };

    onChannelUnsubscribed = async () => {
        this._heartbeat.stop();
        if (this.mySnoovatar) {
            console.log(`${this.mySnoovatar.username} has unsubscribed from the ${this.context.postId} channel`);
        }
    };

    onInterval = async () => {
        await this.sendHeartbeat();

        const prunedWorld: SnooWorld = {};
        for (const [id, snoovatar] of Object.entries(this.world)) {
            if (Date.now() - snoovatar.lastUpdate > 60000 && snoovatar.id !== this.mySnoovatar?.id) {
                continue;
            }
            prunedWorld[id] = snoovatar;
        }
        this.world = prunedWorld;
    };
}
