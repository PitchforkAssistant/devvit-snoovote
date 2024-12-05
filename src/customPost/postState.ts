import {Context, useAsync, UseAsyncResult, useState, UseStateResult} from "@devvit/public-api";
import {PageName, PageStateList} from "./pages.js";
import {BasicPostData, BasicUserData} from "../utils/basicData.js";
import {getRandomSnoovatarUrl} from "../utils/snoovatar.js";
import {SnooPageState} from "./pages/snoos/snoosState.js";
import {isModerator} from "devvit-helpers";
import {ManagerPageState} from "./pages/manager/managerState.js";

export class CustomPostState {
    readonly _currentPage: UseStateResult<PageName>;

    readonly _currentUserId: UseStateResult<string | null>;

    readonly _currentUser: UseAsyncResult<BasicUserData | null>;

    readonly _currentPost: UseAsyncResult<BasicPostData | null>;

    readonly _moderator: UseAsyncResult<boolean>;

    public PageStates: PageStateList;

    constructor (public context: Context, startPage: PageName = "snoos") {
        this._currentPage = useState<PageName>(startPage);

        this._currentUserId = useState<string | null>(context.userId ?? null);

        this._currentUser = useAsync<BasicUserData | null>(async () => {
            const user = await context.reddit.getCurrentUser();
            if (user) {
                const snoovatar = await user.getSnoovatarUrl();
                return {
                    username: user.username,
                    id: user.id,
                    snoovatar: snoovatar ?? getRandomSnoovatarUrl(context.assets, this.currentUserId ?? undefined),
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

        this._moderator = useAsync<boolean>(async () => {
            if (!context.subredditName || !this.currentUser) {
                return false;
            }
            return isModerator(context.reddit, context.subredditName, this.currentUser.username);
        }, {depends: [this.currentUser]});

        // We need to initialize the page states here, otherwise they'll get reset on every page change
        this.PageStates = {
            help: undefined,
            snoos: new SnooPageState(this),
            manager: new ManagerPageState(this),
        };
    }

    get currentPost (): BasicPostData | null {
        return this._currentPost.data;
    }

    get isManager (): boolean {
        return this.isModerator || this.currentUserId === this.currentPost?.author.id;
    }

    get isModerator (): boolean {
        return this._moderator.data ?? false;
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
        if (this._currentUser.loading) {
            return null;
        }
        return this._currentUser.data;
    }

    get currentUserId (): string | null {
        return this._currentUserId[0];
    }
}
