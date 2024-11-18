export type BasicSubredditData = {
    name: string;
    id: string;
};

export type BasicUserData = {
    username: string;
    id: string;
    snoovatar: string;
};

export type BasicPostData = {
    id: string;
    title: string;
    subreddit: BasicSubredditData;
    author: Omit<BasicUserData, "snoovatar">;
    permalink: string;
    score: number;
}
