// @flow
import * as subscriptionsTransportWs from 'subscriptions-transport-ws'
import { createMiddleware, subscribe, unsubscribe } from './index.js'
import { type SubscriptionPayload } from './index.js.flow'

type AppState = {}

type ReduxActionIn = ReduxAction<SubscriptionPayload> | ReduxAction<string>
type ReduxActionOut =
    | ReduxAction<GraphQLResponse>
    | ReduxAction<Array<GraphQLError>>
    | ReduxAction<any>
const mockUnsubscribe: * = jest.fn()
const mockGraphqlResponse: * = { data: {} }
const mockGraphqlResponseWithError: * = {
    data: {},
    error: [{ message: 'Help!' }]
}
const mockSubscribe: * = jest.fn(
    ({ next }: *): * => {
        next(mockGraphqlResponse) // Pass a mock message to the observer
        next(mockGraphqlResponseWithError) // Pass a mock message to the observer with a error

        return { unsubscribe: mockUnsubscribe }
    }
)
const mockRequest: * = jest.fn(
    (): * => ({
        subscribe: mockSubscribe
    })
)

jest.mock(
    'subscriptions-transport-ws',
    (): * => ({
        SubscriptionClient: jest.fn().mockImplementation(
            (): * => {
                return {
                    request: mockRequest
                }
            }
        )
    })
)

describe('Redux Subscriptions Middleware', () => {
    const wsEndpointUrl: string = 'ws://api.example.com/subscriptions'
    const options: * = {
        reconnect: true
    }
    const dispatch: * = jest.fn()
    const getState: * = jest.fn()
    const next: * = jest.fn()
    const middlewareFactory: ReduxMiddleware<
        AppState,
        ReduxActionIn,
        ReduxActionOut
    > = createMiddleware(wsEndpointUrl, options)
    // Hold a single instance of the closed over values
    const middleware: * = middlewareFactory({ dispatch, getState })(next)
    const query: string = 'mock-query'
    const mockChannel: string = 'test'
    const variables: * = {
        channel: mockChannel
    }
    const mockOnMessage: * = jest.fn()
    const mockOnError: * = jest.fn()
    const mockOnUnsubscribe: * = jest.fn()
    const payload: SubscriptionPayload = {
        query,
        variables,
        onMessage: mockOnMessage,
        onError: mockOnError,
        onUnsubscribe: mockOnUnsubscribe
    }
    const subscribeAction: * = subscribe(payload)
    const unSubscribeAction: * = unsubscribe(mockChannel)

    afterEach(
        (): * => {
            jest.clearAllMocks()
        }
    )

    it('Passes url and options to the SubscriptionClient constructor on middleware creation', () => {
        expect(subscriptionsTransportWs.SubscriptionClient).toBeCalledTimes(1)
        expect(subscriptionsTransportWs.SubscriptionClient).toBeCalledWith(
            wsEndpointUrl,
            options
        )
    })

    it('Passes all actions down the middleware chain', () => {
        const unhandledAction: * = { type: 'UNHANDLED' }

        middleware(unhandledAction)

        // Passes the action down the middleware chain
        expect(next).toBeCalledTimes(1)
        expect(next).toBeCalledWith(unhandledAction)
    })

    it('Handles the SUBSCRIBE action', () => {
        middleware(subscribeAction)

        // Make sure that duplicate requests are handled, it shouldn't do everything twice.
        middleware(subscribeAction)

        // Make request to subscribe
        expect(mockRequest).toBeCalledTimes(1)
        expect(mockRequest).toBeCalledWith({ query, variables })

        // Subscribe to messages on the request
        expect(mockSubscribe).toBeCalledTimes(1)

        // Dispatch the given onMessage action when receiving a graphql response
        expect(mockOnMessage).toBeCalledTimes(1)
        expect(mockOnMessage).toBeCalledWith(mockGraphqlResponse)
        expect(dispatch).toBeCalledWith(mockOnMessage(mockGraphqlResponse))

        // Dispatch the given onError action when receiving a graphql response with an error
        expect(mockOnError).toBeCalledTimes(1)
        expect(mockOnError).toBeCalledWith(mockGraphqlResponseWithError.error)
        expect(dispatch).toBeCalledWith(
            mockOnError(mockGraphqlResponseWithError.error)
        )

        // Passes the action down the middleware chain
        expect(next).toBeCalledTimes(2)
        expect(next).toBeCalledWith(subscribeAction)
    })

    it('Handles the UNSUBSCRIBE action', () => {
        middleware(unSubscribeAction)

        // Make sure that duplicate requests are handled, it shouldn't do everything twice.
        middleware(unSubscribeAction)

        expect(mockUnsubscribe).toBeCalledTimes(1)
        expect(mockOnUnsubscribe).toBeCalledTimes(1)
        expect(dispatch).toBeCalledWith(mockOnUnsubscribe())

        // Passes the action down the middleware chain
        expect(next).toBeCalledTimes(2)
        expect(next).toBeCalledWith(unSubscribeAction)
    })
})