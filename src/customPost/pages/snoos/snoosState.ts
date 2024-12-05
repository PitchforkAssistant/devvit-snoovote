import {Context, UseAsyncResult, UseChannelResult, UseIntervalResult, UseStateResult, useAsync, useChannel, useInterval, useState} from "@devvit/public-api";
import {getPostSnooVote, isVoteOwner, SnooVote} from "../../../utils/snooVote.js";
import {ChannelStatus} from "@devvit/public-api/types/realtime.js";
import {SnoovatarData, compareSnoos, getBlankSnoovatarUrl, getRandomSnooPosition} from "../../../utils/snoovatar.js";
import {clamp} from "../../../utils/clamp.js";
import {CustomPostState} from "../../postState.js";
import {Coords, Area, equalCoords} from "../../../utils/coords.js";
import {getPersistentSnoos, SnooWorld, storePersistentSnoo} from "../../../utils/snooWorld.js";
import {AppSettings, defaultAppSettings, getAppSettings} from "../../../settings.js";

export const StepSize: Coords = {x: 5, y: 5, z: 5};
export const WorldBounds: Area = {
    min: {x: 0, y: 0, z: 0},
    max: {x: 100, y: 100, z: 100},
};

export type UserPrefs = {
    showInactive: boolean;
}

export type SnooPagePacket = {
    sessionId: string;
    userId: string;
} & ({
    type: "position";
    data: SnoovatarData;
} | {
    type: "heartbeat";
    data: SnoovatarData;
} | {
    type: "vote";
    data: SnooVote;
} | {
    type: "refresh";
    data: number;
})

export class SnooPageState {
    public context: Context;

    readonly _world: UseStateResult<SnooWorld>;
    readonly _selfLoaded: UseStateResult<boolean>;
    readonly _observer: UseStateResult<boolean>;
    readonly _refresh: UseStateResult<number>;
    readonly _sessionId: UseStateResult<string>;
    readonly _currentVote: UseStateResult<SnooVote | null>;
    readonly _userPrefs: UseStateResult<UserPrefs>;

    readonly _owner: UseAsyncResult<boolean>;
    readonly _initialVote: UseAsyncResult<SnooVote | null>;
    readonly _redisSave: UseAsyncResult<SnoovatarData | null>;
    readonly _ghostWorld: UseAsyncResult<SnooWorld>;
    readonly _appSettings: UseAsyncResult<AppSettings>;

    readonly _heartbeat: UseIntervalResult;

    readonly _channel: UseChannelResult<SnooPagePacket>;

    constructor (readonly postState: CustomPostState) {
        this.context = postState.context;

        this._world = useState<SnooWorld>(() => {
            if (postState.currentUserId) {
                return {
                    [postState.currentUserId]: {
                        id: postState.currentUserId,
                        username: postState.currentUser?.username ?? "",
                        snoovatar: postState.currentUser?.snoovatar ?? getBlankSnoovatarUrl(this.context.assets),
                        position: getRandomSnooPosition(WorldBounds, StepSize),
                        lastUpdate: Date.now(),
                    },
                };
            }
            return {};
        });
        this._selfLoaded = useState<boolean>(false);
        this._observer = useState<boolean>(false);
        this._refresh = useState<number>(0);
        this._sessionId = useState<string>(Math.random().toString(36).substring(2));
        this._currentVote = useState<SnooVote | null>(null);
        this._userPrefs = useState<UserPrefs>(() => ({
            showInactive: true,
        }));

        // _initialVote must be defined before _redisSave, as _redisSave depends on mySnoovatar, which depends on currentVote, which depends on _initialVote
        this._initialVote = useAsync<SnooVote | null>(async () => {
            if (this.context.postId) {
                return getPostSnooVote(this.context.redis, this.context.postId);
            }
            return null;
        });
        this._redisSave = useAsync<SnoovatarData | null>(async () => {
            if (!this.mySnoovatar) {
                if (this.myLastSave) {
                    return this.myLastSave;
                }
                return null;
            }

            if (!this.worldId) {
                return null;
            }

            if (this.currentVote?.frozen || !this.isSelfLoaded) {
                return this.myLastSave;
            }

            if (!this.myLastSave) {
                console.log(`No last save, saving ${this.mySnoovatar.username}'s position to Redis`);
                await storePersistentSnoo(this.context.redis, this.worldId, this.mySnoovatar);
                return this.mySnoovatar;
            }

            if (!equalCoords(this.mySnoovatar.position, this.myLastSave.position)) {
                // only update at most once per x seconds
                if (Date.now() - this.myLastSave.lastUpdate > this.appSettings.redisSaveIntervalMs) {
                    console.log(`Saving ${this.mySnoovatar.username}'s position to Redis`);
                    await storePersistentSnoo(this.context.redis, this.worldId, this.mySnoovatar);
                    return this.mySnoovatar;
                }
                return this.myLastSave;
            } else {
                // No need to update the redis save if the position hasn't changed.
                return this.myLastSave;
            }
        }, {depends: [this.mySnoovatar, this.refresher]});
        this._owner = useAsync<boolean>(async () => {
            if (!this.postState.currentUserId || !this.currentVote?.id) {
                return false;
            }
            return isVoteOwner(this.context.redis, this.postState.currentUserId, this.currentVote.id);
        }, {depends: [postState.currentUserId, this.currentVote]});
        this._ghostWorld = useAsync<SnooWorld>(async () => {
            if (!this.worldId) {
                return {};
            }
            return getPersistentSnoos(this.context.redis, this.worldId);
        }, {depends: [this.worldId, this.refresher]});
        this._appSettings = useAsync<AppSettings>(async () => getAppSettings(this.context.settings), {depends: [this.refresher]});

        this._heartbeat = useInterval(this.onHeartbeatInterval, 1000);

        this._channel = useChannel<SnooPagePacket>({
            name: `snooPageChannel${this.context.postId}`,
            onMessage: this.onChannelMessage,
            onSubscribed: this.onChannelSubscribed,
            onUnsubscribed: this.onChannelUnsubscribed,
        });
        this._channel.subscribe();
    }

    get world (): SnooWorld {
        return this._world[0];
    }
    set world (world: SnooWorld) {
        this._world[1](world);
    }

    get mySnoovatar (): SnoovatarData | null {
        if (this.postState.currentUser) {
            // We want to avoid setting state multiple times, so we'll use this to potentially
            let newWorld: SnooWorld | null = null;

            // If the self ghost isn't loaded, see if the ghost world has loaded and update to the user's saved position
            if (this._ghostWorld && !this.isSelfLoaded && !this._ghostWorld.loading) {
                if (this.ghostWorld[this.postState.currentUser.id]) {
                    newWorld = {
                        ...this.world,
                        [this.postState.currentUser.id]: {
                            ...this.world[this.postState.currentUser.id],
                            position: this.ghostWorld[this.postState.currentUser.id].position,
                        },
                    };
                }
                this.isSelfLoaded = true;
            }

            // TODO: Possibly better integrate this with the this._selfLoaded state
            // If the user is missing a username and currentUser has finished loading, update the world
            if (this.world[this.postState.currentUser.id] && !this.world[this.postState.currentUser.id].username) {
                newWorld = {
                    ...newWorld ?? this.world,
                    [this.postState.currentUser.id]: {
                        ...this.world[this.postState.currentUser.id],
                        username: this.postState.currentUser.username,
                        snoovatar: this.postState.currentUser.snoovatar,
                    },
                };
            }
            if (newWorld) {
                this.world = newWorld;
            }

            return this.world[this.postState.currentUser.id];
        }
        return null;
    }

    get isSelfLoaded (): boolean {
        return this._selfLoaded[0];
    }

    protected set isSelfLoaded (loaded: boolean) {
        this._selfLoaded[1](loaded);
    }

    get isObserver (): boolean {
        return this._observer[0];
    }

    set isObserver (observer: boolean) {
        this._observer[1](observer);
    }

    get sessionId (): string {
        return this._sessionId[0];
    }

    get refresher (): number {
        return this._refresh[0];
    }

    set refresher (time: number) {
        this._refresh[1](time);
    }

    get worldId (): string | null {
        return this.currentVote?.id ?? this.postState.currentPost?.id ?? null;
    }

    get currentVote (): SnooVote | null {
        // Only set the vote from the async load if it's not already set
        if (!this._currentVote[0] && !this._initialVote.loading && this._initialVote.data) {
            this.currentVote = this._initialVote.data;
            return this._initialVote.data;
        }
        return this._currentVote[0];
    }
    set currentVote (vote: SnooVote | null) {
        this._currentVote[1](vote);
    }

    get showInactive (): boolean {
        return this._userPrefs[0].showInactive;
    }
    set showInactive (showInactive: boolean) {
        this._userPrefs[1]({showInactive});
    }

    get isOwner (): boolean {
        return this._owner.data ?? false;
    }

    get myLastSave (): SnoovatarData | null {
        return this._redisSave.data;
    }

    get ghostWorld (): SnooWorld {
        return this._ghostWorld.data ?? {};
    }

    get appSettings (): AppSettings {
        return this._appSettings.data ?? defaultAppSettings;
    }

    get displayWorld (): SnoovatarData[] {
        let fullWorld: SnooWorld = this.world;
        if (this.showInactive) {
            fullWorld = {
                ...this.ghostWorld,
                ...this.world,
            };
        }

        let unsortedWorld = Object.values(fullWorld);
        if (!this.showInactive) {
            const now = Date.now();
            unsortedWorld = unsortedWorld.filter(snoovatar => now - snoovatar.lastUpdate < this.appSettings.inactiveTimeoutMs || snoovatar.id === this.mySnoovatar?.id);
        }

        return unsortedWorld.sort((a, b) => compareSnoos(a, b, this.mySnoovatar?.id));
    }

    get status (): ChannelStatus {
        return this._channel.status;
    }

    getVotes = (choiceId: string): number | undefined => {
        // For frozen votes, return the stored result
        if (this.currentVote?.frozen && this.currentVote?.result && this.currentVote?.result.votes[choiceId] !== undefined) {
            return this.currentVote?.result?.votes[choiceId];
        }

        const numChoices = this.currentVote?.choices.length ?? 0;
        const choiceIndex = this.currentVote?.choices.findIndex(choice => choice.id === choiceId);

        if (!numChoices || choiceIndex === undefined || choiceIndex < 0 || choiceIndex >= numChoices) {
            return undefined;
        }

        if (typeof this.currentVote?.choices[choiceIndex].result === "number") {
            return this.currentVote?.choices[choiceIndex].result;
        }

        // TODO: Untangle the mess between displayWorld, frozen votes, and hiding inactive snoos
        const positions = this.displayWorld.map(snoovatar => snoovatar.position);
        if (numChoices === 2 || numChoices === 3) {
            const choiceMin = choiceIndex * WorldBounds.max.x / numChoices;
            const choiceMax = (choiceIndex + 1) * WorldBounds.max.x / numChoices;
            return positions.filter(pos => pos.x >= choiceMin && pos.x < choiceMax).length;
        }

        if (numChoices === 4) {
            const choiceMin = {
                x: choiceIndex % 2 === 0 ? WorldBounds.min.x - 1 : WorldBounds.max.x / 2,
                y: choiceIndex < 2 ? WorldBounds.min.y - 1 : WorldBounds.max.y / 2,
            };
            const choiceMax = {
                x: choiceIndex % 2 === 0 ? WorldBounds.max.x / 2 : WorldBounds.max.x + 1,
                y: choiceIndex < 2 ? WorldBounds.max.y / 2 : WorldBounds.max.y + 1,
            };

            return positions.filter(pos => pos.x >= choiceMin.x && pos.x < choiceMax.x && pos.y >= choiceMin.y && pos.y < choiceMax.y).length;
        }
    };

    sendToChannel = async (message: Omit<SnooPagePacket, "sessionId" | "userId">) => {
        if (!this.context.userId || !this.sessionId || this.isObserver) {
            return;
        }
        const fullMessage: SnooPagePacket = {
            ...message,
            sessionId: this.sessionId,
            userId: this.context.userId,
        } as SnooPagePacket;
        if (this._channel.status === ChannelStatus.Connected) {
            await this._channel.send(fullMessage);
        } else {
            this._channel.subscribe();
            await this._channel.send(fullMessage);
        }
    };

    sendHeartbeat = async () => {
        if (this.mySnoovatar) {
            await this.sendToChannel({
                type: "heartbeat",
                data: {...this.mySnoovatar, lastUpdate: Date.now()},
            });
        }
    };

    toggleInactives = () => {
        this.showInactive = !this.showInactive;
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
            if (Object.values(this.world).length < this.appSettings.sendPosPacketMaxSnoos) {
                await this.sendToChannel({
                    type: "position",
                    data: myNewSnoovatar,
                });
            }
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

        if (!this.currentVote?.frozen) {
            if (message.type === "position") {
                this.onPositionChange(message.data);
            }

            if (message.type === "heartbeat") {
                if (!this.world[message.userId] || !equalCoords(this.world[message.userId].position, message.data.position)) {
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
        }

        if (message.type === "vote") {
            this._currentVote[1](message.data);
            if (message.data.frozen) {
                this.showInactive = true;
            }
        }

        if (message.type === "refresh") {
            this.refresher = message.data;
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

    onHeartbeatInterval = async () => {
        if (!this.mySnoovatar) {
            return;
        }

        if (Date.now() - this.mySnoovatar.lastUpdate >= this.appSettings.heartbeatIntervalMs) {
            // Set the last update locally
            this.world = {
                ...this.world,
                [this.mySnoovatar.id]: {
                    ...this.mySnoovatar,
                    lastUpdate: Date.now(),
                },
            };
            await this.sendHeartbeat();
        }
    };
}
