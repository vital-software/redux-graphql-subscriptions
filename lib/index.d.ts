import { FSA as Action } from 'flux-standard-action';
import { ExecutionResult as GraphQLResponse, GraphQLError } from 'graphql';
import { ClientOptions } from 'subscriptions-transport-ws';
import { Store, Dispatch } from 'redux';
declare type WsClientStatusMap = {
    CLOSED: 3;
    CLOSING: 2;
    CONNECTING: 0;
    OPEN: 1;
};
declare type ActionOrArrayOfActions = Action<any, any, any> | Array<Action<any, any, any>>;
export declare type SubscriptionPayload = {
    key: string;
    onError?: (payload: readonly GraphQLError[]) => ActionOrArrayOfActions;
    onMessage: (payload: GraphQLResponse) => ActionOrArrayOfActions;
    onSubscribing?: () => ActionOrArrayOfActions;
    onUnsubscribe?: () => ActionOrArrayOfActions;
    query: string;
    variables?: {};
};
export declare type ConnectionPayload = {
    disconnectionTimeout?: number;
    handlers?: {
        onConnected?: () => ActionOrArrayOfActions;
        onConnecting?: () => ActionOrArrayOfActions;
        onDisconnected?: () => ActionOrArrayOfActions;
        onDisconnectionTimeout?: () => Action<any, any, any> | Array<Action<any, any, any>>;
        onError?: (errors?: any) => ActionOrArrayOfActions;
        onReconnected?: () => ActionOrArrayOfActions;
        onReconnecting?: () => ActionOrArrayOfActions;
    };
    options: ClientOptions;
    webSocketImpl?: any;
    webSocketProtocols?: string | Array<string>;
    url: string;
};
declare const CONNECT = "redux-graphql-subscriptions/CONNECT";
declare type ConnectAction = Action<typeof CONNECT, ConnectionPayload>;
export declare const connect: (payload: ConnectionPayload) => import("flux-standard-action").FluxStandardAction<"redux-graphql-subscriptions/CONNECT", ConnectionPayload, undefined>;
declare const DISCONNECT = "redux-graphql-subscriptions/DISCONNECT";
declare type DisconnectAction = Action<typeof DISCONNECT>;
export declare const disconnect: () => import("flux-standard-action").FluxStandardAction<"redux-graphql-subscriptions/DISCONNECT", undefined, undefined>;
declare const SUBSCRIBE = "redux-graphql-subscriptions/SUBSCRIBE";
export declare type SubscribeAction = Action<typeof SUBSCRIBE, SubscriptionPayload>;
export declare type SubscribeActionCreator = (subscription: SubscriptionPayload) => SubscribeAction;
export declare const subscribe: SubscribeActionCreator;
declare const UNSUBSCRIBE = "redux-graphql-subscriptions/UNSUBSCRIBE";
export declare type UnsubscribeAction = Action<typeof UNSUBSCRIBE, string>;
export declare type UnubscribeActionCreator = (key: string) => UnsubscribeAction;
export declare const unsubscribe: UnubscribeActionCreator;
declare const ERROR = "redux-graphql-subscriptions/ERROR";
declare type ErrorAction = Action<typeof ERROR, readonly GraphQLError[]>;
export declare const error: (payload: readonly GraphQLError[]) => import("flux-standard-action").FluxStandardAction<"redux-graphql-subscriptions/ERROR", readonly GraphQLError[], undefined>;
export declare type ReduxGraphQLSubscriptionActionUnion = ConnectAction | DisconnectAction | SubscribeAction | UnsubscribeAction | ErrorAction;
export declare const WS_CLIENT_STATUS: WsClientStatusMap;
export declare function createMiddleware<S>(): ({ dispatch }: Store<S, import("redux").AnyAction>) => (next: Dispatch<import("flux-standard-action").FluxStandardAction<any, any, any>>) => (action: ReduxGraphQLSubscriptionActionUnion) => ReduxGraphQLSubscriptionActionUnion;
export {};
