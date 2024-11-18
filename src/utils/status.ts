import {ChannelStatus} from "@devvit/public-api/types/realtime.js";

type StatusTextMapType = Record<ChannelStatus, string>;

const StatusTextMap: StatusTextMapType = {
    [ChannelStatus.Connected]: "Connected",
    [ChannelStatus.Connecting]: "Connecting",
    [ChannelStatus.Disconnected]: "Disconnected",
    [ChannelStatus.Disconnecting]: "Disconnecting",
    [ChannelStatus.Unknown]: "Unknown",
};

export function stringifyChannelStatus (status: ChannelStatus): string {
    return StatusTextMap[status];
}
