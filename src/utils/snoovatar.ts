import {AssetsClient} from "@devvit/public-api/apis/AssetsClient/AssetsClient.js";
import {Area, Coords, isCoords} from "./coords.js";
import {BasicUserData} from "./basicData.js";

export type SnoovatarData = BasicUserData & {position: Coords, lastUpdate: number};

export function isSnoovatarData (object: unknown): object is SnoovatarData {
    if (!object || typeof object !== "object") {
        return false;
    }
    const snoovatarData = object as SnoovatarData;
    return typeof snoovatarData.position === "object" &&
           isCoords(snoovatarData.position) &&
           typeof snoovatarData.lastUpdate === "number";
}

export function compareSnoos (a: SnoovatarData, b: SnoovatarData, myId?: string) {
    if (a.position.z !== b.position.z) {
        return a.position.z - b.position.z;
    }
    if (a.id === myId) {
        return 1;
    }
    if (b.id === myId) {
        return -1;
    }

    // Should prevent a lot of flickering by sorting equivalent Snoos by ID
    return b.id.localeCompare(a.id);
}

export const randomSnoovatars = [
    "avatars/Avatar_A1.png",
    "avatars/Avatar_Animal_Cat.png",
    "avatars/Avatar_Animal_Corgi.png",
    "avatars/Avatar_Animal_Deer.png",
    "avatars/Avatar_Animal_Dog.png",
    "avatars/Avatar_Animal_Fox.png",
    "avatars/Avatar_Animal_Hamster.png",
    "avatars/Avatar_Animal_Iguana.png",
    "avatars/Avatar_Animal_Koala.png",
    "avatars/Avatar_Animal_Lizard.png",
    "avatars/Avatar_Animal_Narwhal.png",
    "avatars/Avatar_Animal_Owl.png",
    "avatars/Avatar_Animal_Parrot.png",
    "avatars/Avatar_Animal_Penguin.png",
    "avatars/Avatar_Animal_Pig.png",
    "avatars/Avatar_Animal_Pigeon.png",
    "avatars/Avatar_Animal_Porcupine.png",
    "avatars/Avatar_Animal_Seal.png",
    "avatars/Avatar_Animal_Sloth.png",
    "avatars/Avatar_Animal_Snake.png",
    "avatars/Avatar_Animal_Tiger.png",
    "avatars/Avatar_Animal_WhiteCat.png",
    "avatars/Avatar_Anonymous.png",
    "avatars/Avatar_Arcane_001.png",
    "avatars/Avatar_Arcane_002.png",
    "avatars/Avatar_Arcane_003.png",
    "avatars/Avatar_Arcane_004.png",
    "avatars/Avatar_Arcane_005.png",
    "avatars/Avatar_Arcane_006.png",
    "avatars/Avatar_Arcane_007.png",
    "avatars/Avatar_Arcane_008.png",
    "avatars/Avatar_Arcane_009.png",
    "avatars/Avatar_Arcane_010.png",
    "avatars/Avatar_Arcane_011.png",
    "avatars/Avatar_Arcane_012.png",
    "avatars/Avatar_Australia_001.png",
    "avatars/Avatar_Australia_002.png",
    "avatars/Avatar_Australia_003.png",
    "avatars/Avatar_Australia_004.png",
    "avatars/Avatar_Australia_005.png",
    "avatars/Avatar_Baseball.png",
    "avatars/Avatar_Basketball.png",
    "avatars/Avatar_Cricket.png",
    "avatars/Avatar_Destiny_001.png",
    "avatars/Avatar_Destiny_002.png",
    "avatars/Avatar_Destiny_003.png",
    "avatars/Avatar_Destiny_004.png",
    "avatars/Avatar_Destiny_005.png",
    "avatars/Avatar_Destiny_006.png",
    "avatars/Avatar_DiamondHands_001.png",
    "avatars/Avatar_DiamondHands_002.png",
    "avatars/Avatar_DiamondHands_003.png",
    "avatars/Avatar_DiamondHands_004.png",
    "avatars/Avatar_DiversityAndInclusion_001.png",
    "avatars/Avatar_DiversityAndInclusion_002.png",
    "avatars/Avatar_DiversityAndInclusion_003.png",
    "avatars/Avatar_DiversityAndInclusion_004.png",
    "avatars/Avatar_DiversityAndInclusion_005.png",
    "avatars/Avatar_DiversityAndInclusion_006.png",
    "avatars/Avatar_Doge_001.png",
    "avatars/Avatar_Doge_002.png",
    "avatars/Avatar_EarthDay_001.png",
    "avatars/Avatar_EarthDay_002.png",
    "avatars/Avatar_Fantasy_001.png",
    "avatars/Avatar_Fantasy_002.png",
    "avatars/Avatar_Fantasy_003.png",
    "avatars/Avatar_Fantasy_004.png",
    "avatars/Avatar_Fantasy_005.png",
    "avatars/Avatar_Fantasy_006.png",
    "avatars/Avatar_Fantasy_007.png",
    "avatars/Avatar_Fantasy_008.png",
    "avatars/Avatar_Fantasy_009.png",
    "avatars/Avatar_Fantasy_010.png",
    "avatars/Avatar_Fantasy_011.png",
    "avatars/Avatar_Fantasy_012.png",
    "avatars/Avatar_Fantasy_013.png",
    "avatars/Avatar_Football_001.png",
    "avatars/Avatar_Football_002.png",
    "avatars/Avatar_Gaming_001.png",
    "avatars/Avatar_Gaming_002.png",
    "avatars/Avatar_Gaming_003.png",
    "avatars/Avatar_Gaming_004.png",
    "avatars/Avatar_Gaming_005.png",
    "avatars/Avatar_Gaming_006.png",
    "avatars/Avatar_Gaming_007.png",
    "avatars/Avatar_Gaming_008.png",
    "avatars/Avatar_Halloween_001.png",
    "avatars/Avatar_Halloween_002.png",
    "avatars/Avatar_Halloween_003.png",
    "avatars/Avatar_Halloween_004.png",
    "avatars/Avatar_Halloween_005.png",
    "avatars/Avatar_Halloween_006.png",
    "avatars/Avatar_Halloween_007.png",
    "avatars/Avatar_Halloween_008.png",
    "avatars/Avatar_Halloween_009.png",
    "avatars/Avatar_Halloween_010.png",
    "avatars/Avatar_Halloween_011.png",
    "avatars/Avatar_Halloween_012.png",
    "avatars/Avatar_Halloween_013.png",
    "avatars/Avatar_Hockey.png",
    "avatars/Avatar_Holiday_001.png",
    "avatars/Avatar_Holiday_002.png",
    "avatars/Avatar_Holiday_003.png",
    "avatars/Avatar_Holiday_004.png",
    "avatars/Avatar_Holiday_005.png",
    "avatars/Avatar_Holiday_006.png",
    "avatars/Avatar_Holiday_007.png",
    "avatars/Avatar_Holiday_008.png",
    "avatars/Avatar_Holiday_009.png",
    "avatars/Avatar_Holiday_010.png",
    "avatars/Avatar_Holiday_011.png",
    "avatars/Avatar_Holiday_012.png",
    "avatars/Avatar_Holiday_013.png",
    "avatars/Avatar_Holiday_014.png",
    "avatars/Avatar_Holiday_015.png",
    "avatars/Avatar_Holiday_016.png",
    "avatars/Avatar_InagurationBernie.png",
    "avatars/Avatar_Lounge_001.png",
    "avatars/Avatar_Lounge_002.png",
    "avatars/Avatar_Lounge_003.png",
    "avatars/Avatar_Lounge_004.png",
    "avatars/Avatar_Lounge_005.png",
    "avatars/Avatar_LunarNewYear_001.png",
    "avatars/Avatar_LunarNewYear_002.png",
    "avatars/Avatar_LunarNewYear_003.png",
    "avatars/Avatar_LunarNewYear_004.png",
    "avatars/Avatar_NewGraduate_001.png",
    "avatars/Avatar_NewGraduate_002.png",
    "avatars/Avatar_NewGraduate_003.png",
    "avatars/Avatar_NewGraduate_004.png",
    "avatars/Avatar_NewGraduate_005.png",
    "avatars/Avatar_NewGraduate_006.png",
    "avatars/Avatar_Ninja_001.png",
    "avatars/Avatar_Ninja_002.png",
    "avatars/Avatar_Ninja_003.png",
    "avatars/Avatar_OneYearAchievement.png",
    "avatars/Avatar_Pirate_001.png",
    "avatars/Avatar_Pirate_002.png",
    "avatars/Avatar_Pirate_003.png",
    "avatars/Avatar_Pirate_004.png",
    "avatars/Avatar_Pirate_005.png",
    "avatars/Avatar_PopStar_001.png",
    "avatars/Avatar_PopStar_002.png",
    "avatars/Avatar_PopStar_003.png",
    "avatars/Avatar_PopStar_004.png",
    "avatars/Avatar_PopStar_005.png",
    "avatars/Avatar_PopStar_006.png",
    "avatars/Avatar_PopStar_007.png",
    "avatars/Avatar_PopStar_008.png",
    "avatars/Avatar_PopStar_009.png",
    "avatars/Avatar_PopStar_010.png",
    "avatars/Avatar_PopStar_011.png",
    "avatars/Avatar_PopStar_012.png",
    "avatars/Avatar_PopStar_013.png",
    "avatars/Avatar_PopStar_014.png",
    "avatars/Avatar_Pride_001.png",
    "avatars/Avatar_Pride_002.png",
    "avatars/Avatar_Pride_003.png",
    "avatars/Avatar_Ramadan_001.png",
    "avatars/Avatar_Ramadan_002.png",
    "avatars/Avatar_Ramadan_003.png",
    "avatars/Avatar_RedditIntern_001.png",
    "avatars/Avatar_RedditIntern_002.png",
    "avatars/Avatar_RedditIntern_003.png",
    "avatars/Avatar_RedditIntern_004.png",
    "avatars/Avatar_RedditIntern_005.png",
    "avatars/Avatar_RedditIntern_006.png",
    "avatars/Avatar_RedditRecap2021.png",
    "avatars/Avatar_Romance_001.png",
    "avatars/Avatar_Romance_002.png",
    "avatars/Avatar_Romance_003.png",
    "avatars/Avatar_Romance_004.png",
    "avatars/Avatar_Romance_005.png",
    "avatars/Avatar_Romance_006.png",
    "avatars/Avatar_Romance_007.png",
    "avatars/Avatar_Romance_008.png",
    "avatars/Avatar_Romance_009.png",
    "avatars/Avatar_Romance_010.png",
    "avatars/Avatar_Romance_011.png",
    "avatars/Avatar_Romance_012.png",
    "avatars/Avatar_Romance_013.png",
    "avatars/Avatar_Romance_014.png",
    "avatars/Avatar_Skateboarding.png",
    "avatars/Avatar_Soccer.png",
    "avatars/Avatar_SpringBreak_001.png",
    "avatars/Avatar_SpringBreak_002.png",
    "avatars/Avatar_SpringBreak_003.png",
    "avatars/Avatar_SpringBreak_004.png",
    "avatars/Avatar_SpringBreak_005.png",
    "avatars/Avatar_SpringBreak_006.png",
    "avatars/Avatar_SpringBreak_007.png",
    "avatars/Avatar_SpringBreak_008.png",
    "avatars/Avatar_SpringBreak_009.png",
    "avatars/Avatar_SpringBreak_010.png",
    "avatars/Avatar_StPatricksDay_001.png",
    "avatars/Avatar_StPatricksDay_002.png",
    "avatars/Avatar_StrangerThings_001.png",
    "avatars/Avatar_StrangerThings_002.png",
    "avatars/Avatar_StrangerThings_003.png",
    "avatars/Avatar_StrangerThings_004.png",
    "avatars/Avatar_StrangerThings_005.png",
    "avatars/Avatar_StrangerThings_006.png",
    "avatars/Avatar_StrangerThings_007.png",
    "avatars/Avatar_StrangerThings_008.png",
    "avatars/Avatar_SuperHero_001.png",
    "avatars/Avatar_SuperHero_002.png",
    "avatars/Avatar_SuperHero_003.png",
    "avatars/Avatar_SuperHero_004.png",
    "avatars/Avatar_SuperHero_005.png",
    "avatars/Avatar_SuperHero_006.png",
    "avatars/Avatar_SuperHero_007.png",
    "avatars/Avatar_SuperHero_008.png",
    "avatars/Avatar_SuperHero_009.png",
    "avatars/Avatar_SuperHero_010.png",
    "avatars/Avatar_SuperHero_011.png",
    "avatars/Avatar_SuperHero_012.png",
    "avatars/Avatar_SuperHero_013.png",
    "avatars/Avatar_SuperHero_014.png",
    "avatars/Avatar_SuperHero_015.png",
    "avatars/Avatar_SuperHero_016.png",
    "avatars/Avatar_SuperbOwl_001.png",
    "avatars/Avatar_SuperbOwl_002.png",
    "avatars/Avatar_Teenagers_001.png",
    "avatars/Avatar_Teenagers_002.png",
    "avatars/Avatar_Teenagers_003.png",
    "avatars/Avatar_Teenagers_004.png",
    "avatars/Avatar_Teenagers_005.png",
    "avatars/Avatar_Tennis.png",
    "avatars/Avatar_Volleyball.png",
    "avatars/Avatar_Wrestling.png",
];

/* eslint-disable camelcase */
export const assignedSnoovatars: Record<string, string> = {
    t2_qikfu: "avatars/Avatar_PitchforkAssistant.png",
    t2_4v98f: "avatars/Avatar_Xenc.png",
    t2_21ralb61: "avatars/Avatar_AnAbsurdlyAngryGoose.png",
};
/* eslint-enable camelcase */

export function getBlankSnoovatarUrl (assets: AssetsClient): string {
    return assets.getURL("avatars/Avatar_Missing.png");
}

export function getRandomSnoovatarUrl (assets: AssetsClient, userId?: string): string {
    if (userId && assignedSnoovatars[userId]) {
        return assets.getURL(assignedSnoovatars[userId]);
    }
    const randomIndex = Math.floor(Math.random() * randomSnoovatars.length);
    return assets.getURL(randomSnoovatars[randomIndex]);
}

export function getRandomSnooPosition (bounds: Area, stepSize: Coords): Coords {
    // Get integer within bounds
    const initialX = Math.floor(Math.random() * (bounds.max.x - bounds.min.x)) + bounds.min.x;
    const initialY = Math.floor(Math.random() * (bounds.max.y - bounds.min.y)) + bounds.min.y;

    // Snap to grid created by step size
    // Also z is used for scale, so it's always 1 by default
    return {
        x: initialX - initialX % stepSize.x,
        y: initialY - initialY % stepSize.y,
        z: 0,
    };
}
