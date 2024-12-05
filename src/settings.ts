import {Devvit, SettingsClient} from "@devvit/public-api";

export type AppSettings = {
    sendPosPacketMaxSnoos: number;
    redisSaveIntervalMs: number;
    heartbeatIntervalMs: number;
    inactiveTimeoutMs: number;
}

export const defaultAppSettings: AppSettings = {
    sendPosPacketMaxSnoos: 10,
    redisSaveIntervalMs: 10000,
    heartbeatIntervalMs: 1000,
    inactiveTimeoutMs: 60000,
};

export async function getAppSettings (settings: SettingsClient): Promise<AppSettings> {
    const allSettings = await settings.getAll<AppSettings>();

    return {
        sendPosPacketMaxSnoos: typeof allSettings.sendPosPacketMaxSnoos === "number" ? allSettings.sendPosPacketMaxSnoos : defaultAppSettings.sendPosPacketMaxSnoos,
        redisSaveIntervalMs: typeof allSettings.redisSaveIntervalMs === "number" ? allSettings.redisSaveIntervalMs : defaultAppSettings.redisSaveIntervalMs,
        heartbeatIntervalMs: typeof allSettings.heartbeatIntervalMs === "number" ? allSettings.heartbeatIntervalMs : defaultAppSettings.heartbeatIntervalMs,
        inactiveTimeoutMs: typeof allSettings.inactiveTimeoutMs === "number" ? allSettings.inactiveTimeoutMs : defaultAppSettings.inactiveTimeoutMs,
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
]);
