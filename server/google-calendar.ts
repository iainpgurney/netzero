import { google } from 'googleapis'

// ==========================================
// Google Calendar API Integration
//
// Creates leave events on employee calendars and shared Holiday Tracker.
// Uses same service account as Google Admin (domain-wide delegation).
//
// Required scope in Google Admin Console:
//   https://www.googleapis.com/auth/calendar
//   https://www.googleapis.com/auth/calendar.events
//
// Environment variables (same as google-admin):
//   GOOGLE_SA_CLIENT_EMAIL, GOOGLE_SA_PRIVATE_KEY, GOOGLE_ADMIN_EMAIL
//   GOOGLE_HOLIDAY_TRACKER_CALENDAR_ID (optional; defaults to Carma Holiday Tracker)
// ==========================================

const SA_CLIENT_EMAIL = process.env.GOOGLE_SA_CLIENT_EMAIL?.trim()
const SA_PRIVATE_KEY = process.env.GOOGLE_SA_PRIVATE_KEY?.replace(/\\n/g, '\n')?.trim()
const ADMIN_EMAIL = process.env.GOOGLE_ADMIN_EMAIL?.trim() || 'iain.gurney@carma.earth'
const HOLIDAY_TRACKER_CALENDAR_ID =
  process.env.GOOGLE_HOLIDAY_TRACKER_CALENDAR_ID?.trim() ||
  'c_2ffa755c66861fdef3bbd35562034b81c1d391af33b1bed3c3dfa0b5a2d2c99a@group.calendar.google.com'

export function isGoogleCalendarConfigured(): boolean {
  return !!(SA_CLIENT_EMAIL && SA_PRIVATE_KEY)
}

function getCalendarClient() {
  if (!SA_CLIENT_EMAIL || !SA_PRIVATE_KEY) {
    return null
  }

  const auth = new google.auth.JWT({
    email: SA_CLIENT_EMAIL,
    key: SA_PRIVATE_KEY,
    scopes: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ],
    subject: ADMIN_EMAIL,
  })

  return google.calendar({ version: 'v3', auth })
}

export interface CreateLeaveEventResult {
  eventId: string | null
  error: string | null
}

function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/**
 * Create a leave event on an employee's primary Google Calendar.
 * Uses their email as calendarId (primary calendar).
 * All-day events use date format (UK timezone).
 */
export async function createLeaveEventOnEmployeeCalendar(
  userEmail: string,
  userName: string,
  startDate: Date,
  endDate: Date,
  type: 'annual_leave' | 'sick_leave' | 'volunteer_leave' = 'annual_leave'
): Promise<CreateLeaveEventResult> {
  try {
    const calendar = getCalendarClient()
    if (!calendar) {
      return { eventId: null, error: 'Google Calendar not configured' }
    }

    const summary =
      type === 'sick_leave'
        ? `${userName} - Sick Leave`
        : type === 'volunteer_leave'
        ? `${userName} - Volunteer`
        : `${userName} - Annual Leave`
    const endExclusive = new Date(endDate)
    endExclusive.setDate(endExclusive.getDate() + 1)
    const event = {
      summary,
      description: `Time off (${type.replace('_', ' ')}) - created by Carma Time Off Manager`,
      start: { date: toDateString(startDate) },
      end: { date: toDateString(endExclusive) },
    }

    const response = await calendar.events.insert({
      calendarId: userEmail,
      requestBody: event,
      sendUpdates: 'all',
    })

    return { eventId: response.data.id || null, error: null }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[GOOGLE CALENDAR] Error creating employee event:', message)
    return { eventId: null, error: message }
  }
}

/**
 * Create a leave event on the shared Holiday Tracker calendar.
 */
export async function createLeaveEventOnSharedCalendar(
  userName: string,
  userEmail: string,
  startDate: Date,
  endDate: Date,
  type: 'annual_leave' | 'sick_leave' | 'volunteer_leave' = 'annual_leave'
): Promise<CreateLeaveEventResult> {
  try {
    const calendar = getCalendarClient()
    if (!calendar) {
      return { eventId: null, error: 'Google Calendar not configured' }
    }

    const summary =
      type === 'sick_leave'
        ? `${userName} - Sick`
        : type === 'volunteer_leave'
        ? `${userName} - Volunteer`
        : `${userName} - Annual Leave`
    const endExclusive = new Date(endDate)
    endExclusive.setDate(endExclusive.getDate() + 1)
    const event = {
      summary,
      description: `${userEmail} - ${type.replace('_', ' ')}`,
      start: { date: toDateString(startDate) },
      end: { date: toDateString(endExclusive) },
    }

    const response = await calendar.events.insert({
      calendarId: HOLIDAY_TRACKER_CALENDAR_ID,
      requestBody: event,
      sendUpdates: 'all',
    })

    return { eventId: response.data.id || null, error: null }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[GOOGLE CALENDAR] Error creating shared calendar event:', message)
    return { eventId: null, error: message }
  }
}

/**
 * Create leave events on both employee calendar and Holiday Tracker.
 * Returns both event IDs.
 */
export async function createLeaveEvents(
  userEmail: string,
  userName: string,
  startDate: Date,
  endDate: Date,
  type: 'annual_leave' | 'sick_leave' | 'volunteer_leave' = 'annual_leave'
): Promise<{
  googleEventId: string | null
  sharedEventId: string | null
  errors: string[]
}> {
  const errors: string[] = []
  let googleEventId: string | null = null
  let sharedEventId: string | null = null

  const empResult = await createLeaveEventOnEmployeeCalendar(
    userEmail,
    userName,
    startDate,
    endDate,
    type
  )
  if (empResult.error) {
    errors.push(`Employee calendar: ${empResult.error}`)
  } else if (empResult.eventId) {
    googleEventId = empResult.eventId
  }

  const sharedResult = await createLeaveEventOnSharedCalendar(
    userName,
    userEmail,
    startDate,
    endDate,
    type
  )
  if (sharedResult.error) {
    errors.push(`Holiday Tracker: ${sharedResult.error}`)
  } else if (sharedResult.eventId) {
    sharedEventId = sharedResult.eventId
  }

  return { googleEventId, sharedEventId, errors }
}

/**
 * Delete leave events from employee calendar and Holiday Tracker.
 * Logs errors but does not throw (allows cancel to succeed even if calendar delete fails).
 */
export async function deleteLeaveEvents(
  googleEventId: string | null,
  sharedEventId: string | null,
  userEmail: string
): Promise<void> {
  const calendar = getCalendarClient()
  if (!calendar) {
    console.warn('[GOOGLE CALENDAR] Not configured, skipping delete')
    return
  }

  if (googleEventId && userEmail) {
    try {
      await calendar.events.delete({
        calendarId: userEmail,
        eventId: googleEventId,
        sendUpdates: 'all',
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      console.error('[GOOGLE CALENDAR] Error deleting employee event:', message)
    }
  }

  if (sharedEventId) {
    try {
      await calendar.events.delete({
        calendarId: HOLIDAY_TRACKER_CALENDAR_ID,
        eventId: sharedEventId,
        sendUpdates: 'all',
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      console.error('[GOOGLE CALENDAR] Error deleting shared calendar event:', message)
    }
  }
}
