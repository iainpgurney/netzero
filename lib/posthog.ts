import posthog from 'posthog-js'

// Type assertion for __loaded property
export const posthogClient = posthog as typeof posthog & {
  __loaded?: boolean
}

export { posthogClient as posthog }

