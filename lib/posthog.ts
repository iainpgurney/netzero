import posthog from 'posthog-js'

// Declare the __loaded property for TypeScript
declare module 'posthog-js' {
  interface PostHog {
    __loaded?: boolean
  }
}

export { posthog }

