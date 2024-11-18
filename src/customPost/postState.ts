import {Context, useAsync, UseAsyncResult, useState, UseStateResult} from "@devvit/public-api";
import {PageName, PageStateList} from "./pages.js";
import {BasicPostData, BasicUserData} from "../utils/basicData.js";
import {getRandomSnoovatarUrl} from "../utils/snoovatar.js";
import {SnooPageState} from "./snooManager.js";
import {isModerator} from "devvit-helpers";

export class CustomPostState {
    readonly _currentPage: UseStateResult<PageName>;

    readonly _currentUser: UseStateResult<BasicUserData | null>;

    readonly _currentPost: UseAsyncResult<BasicPostData | null>;

    readonly _manager: UseAsyncResult<boolean>;

    public PageStates: PageStateList;

    constructor (public context: Context, startPage: PageName = "snoos") {
        this._currentPage = useState<PageName>(startPage);

        this._currentUser = useState<BasicUserData | null>(async () => {
            const user = await context.reddit.getCurrentUser();
            if (user) {
                const snoovatar = await user.getSnoovatarUrl();
                return {
                    username: user.username,
                    id: user.id,
                    snoovatar: snoovatar ?? getRandomSnoovatarUrl(context.assets),
                };
            }
            return null;
        });

        this._currentPost = useAsync<BasicPostData | null>(async () => {
            if (!context.postId) {
                return null;
            }
            const post = await context.reddit.getPostById(context.postId);
            return {
                title: post.title,
                id: post.id,
                subreddit: {
                    name: post.subredditName,
                    id: post.subredditId,
                },
                author: {
                    username: post.authorName ?? "",
                    id: post.authorId ?? "",
                },
                permalink: post.permalink,
                score: post.score,
            };
        });

        this._manager = useAsync<boolean>(async () => {
            if (!context.subredditName || !this.currentUser) {
                return false;
            }
            return isModerator(context.reddit, context.subredditName, this.currentUser.username);
        }, {depends: [this.currentUser]});

        // We need to initialize the page states here, otherwise they'll get reset on every page change
        this.PageStates = {
            snoos: new SnooPageState(this),
            help: undefined,
        };
    }

    get currentPost (): BasicPostData | null {
        return this._currentPost.data;
    }

    get isManager (): boolean {
        return this._manager.data ?? false;
    }

    get isDebug (): boolean {
        if (!this.currentPost) {
            return false;
        }
        return this.currentPost.title.includes("debug");
    }

    get currentPage (): PageName {
        return this._currentPage[0];
    }

    protected set currentPage (page: PageName) {
        this._currentPage[1](page);
    }

    changePage (page: PageName): void {
        if (this.currentPage === page) {
            return;
        }
        this.currentPage = page;
    }

    get currentUser (): BasicUserData | null {
        return this._currentUser[0];
    }
}
