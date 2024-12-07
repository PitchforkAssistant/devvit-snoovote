import {Devvit, SettingsClient} from "@devvit/public-api";

export type AppSettings = {
    sendPosPacketMaxSnoos: number;
    redisSaveIntervalMs: number;
    heartbeatIntervalMs: number;
    inactiveTimeoutMs: number;
    discordUrl: string;
    moreUrl: string;
    forceRefreshes: boolean;
    forceRefreshIntevalMs: number;
}

export const defaultAppSettings: AppSettings = {
    sendPosPacketMaxSnoos: 10,
    redisSaveIntervalMs: 10000,
    heartbeatIntervalMs: 1000,
    inactiveTimeoutMs: 60000,
    discordUrl: "https://discord.gg/HKMxwCfbrN",
    moreUrl: "https://sh.reddit.com/r/ModWorldDevvit/comments/1h5zwsw/devvit_app_showcase/",
    forceRefreshes: false,
    forceRefreshIntevalMs: 10000,
};

export async function getAppSettings (settings: SettingsClient): Promise<AppSettings> {
    const allSettings = await settings.getAll<AppSettings>();

    return {
        sendPosPacketMaxSnoos: typeof allSettings.sendPosPacketMaxSnoos === "number" ? allSettings.sendPosPacketMaxSnoos : defaultAppSettings.sendPosPacketMaxSnoos,
        redisSaveIntervalMs: typeof allSettings.redisSaveIntervalMs === "number" ? allSettings.redisSaveIntervalMs : defaultAppSettings.redisSaveIntervalMs,
        heartbeatIntervalMs: typeof allSettings.heartbeatIntervalMs === "number" ? allSettings.heartbeatIntervalMs : defaultAppSettings.heartbeatIntervalMs,
        inactiveTimeoutMs: typeof allSettings.inactiveTimeoutMs === "number" ? allSettings.inactiveTimeoutMs : defaultAppSettings.inactiveTimeoutMs,
        discordUrl: typeof allSettings.discordUrl === "string" ? allSettings.discordUrl : defaultAppSettings.discordUrl,
        moreUrl: typeof allSettings.moreUrl === "string" ? allSettings.moreUrl : defaultAppSettings.moreUrl,
        forceRefreshes: typeof allSettings.forceRefreshes === "boolean" ? allSettings.forceRefreshes : defaultAppSettings.forceRefreshes,
        forceRefreshIntevalMs: typeof allSettings.forceRefreshIntevalMs === "number" ? allSettings.forceRefreshIntevalMs : defaultAppSettings.forceRefreshIntevalMs,
    };
}

// Set up the configuration field presented to the user for each installation (subreddit) of the app.
export const devvitAppSettings = Devvit.addSettings([
    {
        type: "number",
        name: "sendPosPacketMaxSnoos",
        label: "Position Packet Snoo Limit",
        helpText: "Once the world has more than this many snoos, the position packet will not be sent to the client. This will reduce position updates to 1 per second.",
        defaultValue: defaultAppSettings.sendPosPacketMaxSnoos,
    },
    {
        type: "number",
        name: "redisSaveIntervalMs",
        label: "Redis Save Interval",
        helpText: "Minimum delay in milliseconds between a client saving their Snoo to Redis.",
        defaultValue: defaultAppSettings.redisSaveIntervalMs,
    },
    {
        type: "number",
        name: "heartbeatIntervalMs",
        label: "Heartbeat Packet Interval",
        helpText: "Minimum delay in milliseconds between a client sending a heartbeat packet.",
        defaultValue: defaultAppSettings.heartbeatIntervalMs,
    },
    {
        type: "number",
        name: "inactiveTimeoutMs",
        label: "Inactive Snoo Timeout",
        helpText: "If a Snoo has not sent a heartbeat packet in this many milliseconds, it will be considered inactive.",
        defaultValue: defaultAppSettings.inactiveTimeoutMs,
    },
    {
        type: "string",
        name: "discordUrl",
        label: "Discord URL",
        helpText: "This is used as the Discord link on the app help page.",
        defaultValue: defaultAppSettings.discordUrl,
    },
    {
        type: "string",
        name: "moreUrl",
        label: "More URL",
        helpText: "This is used as the 'Check out the other demos!' link on the app help page.",
        defaultValue: defaultAppSettings.moreUrl,
    },
    {
        type: "boolean",
        name: "forceRefreshes",
        label: "Force Refreshes",
        helpText: "If enabled, the app will send a refresh packet to all clients every Force Refresh Interval milliseconds.",
        defaultValue: defaultAppSettings.forceRefreshes,
    },
    {
        type: "number",
        name: "forceRefreshIntevalMs",
        label: "Force Refresh Interval",
        helpText: "If Force Refreshes is enabled, this is the minimum delay in milliseconds between sending a refresh packet to all clients. Does not go below 1000ms.",
        defaultValue: defaultAppSettings.forceRefreshIntevalMs,
    },
]);
