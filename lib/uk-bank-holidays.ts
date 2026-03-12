/**
 * UK England & Wales bank holidays.
 * Used to exclude these from leave day calculations (2 weeks = 10 working days).
 */

// Easter calculation (Anonymous Gregorian algorithm)
function getEasterSunday(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month, day)
}

function getBankHolidaysForYear(year: number): Date[] {
  const dates: Date[] = []
  const pad = (d: Date) => {
    d.setHours(0, 0, 0, 0)
    return d
  }

  // New Year's Day (1 Jan, or next weekday if weekend)
  const ny = new Date(year, 0, 1)
  const nyDay = ny.getDay()
  if (nyDay === 0) dates.push(pad(new Date(year, 0, 2)))
  else if (nyDay === 6) dates.push(pad(new Date(year, 0, 3)))
  else dates.push(pad(new Date(year, 0, 1)))

  // Good Friday & Easter Monday
  const easter = getEasterSunday(year)
  const goodFriday = new Date(easter)
  goodFriday.setDate(goodFriday.getDate() - 2)
  dates.push(pad(goodFriday))
  const easterMonday = new Date(easter)
  easterMonday.setDate(easterMonday.getDate() + 1)
  dates.push(pad(easterMonday))

  // Early May (first Monday in May)
  const may1 = new Date(year, 4, 1)
  const daysToFirstMonday = may1.getDay() === 0 ? 1 : may1.getDay() === 1 ? 0 : (8 - may1.getDay()) % 7
  const earlyMay = new Date(year, 4, 1 + daysToFirstMonday)
  dates.push(pad(earlyMay))

  // Spring Bank (last Monday in May)
  const may31 = new Date(year, 4, 31)
  const springBank = new Date(year, 4, 31)
  springBank.setDate(31 - ((may31.getDay() + 6) % 7))
  dates.push(pad(springBank))

  // Summer Bank (last Monday in August)
  const aug31 = new Date(year, 7, 31)
  const summerBank = new Date(year, 7, 31)
  summerBank.setDate(31 - ((aug31.getDay() + 6) % 7))
  dates.push(pad(summerBank))

  // Christmas & Boxing Day
  const christmas = new Date(year, 11, 25)
  const boxingDay = new Date(year, 11, 26)
  const christmasDay = christmas.getDay()
  const boxingDayOfWeek = boxingDay.getDay()
  if (christmasDay === 0) {
    dates.push(pad(new Date(year, 11, 27)))
    dates.push(pad(new Date(year, 11, 28)))
  } else if (christmasDay === 6) {
    dates.push(pad(new Date(year, 11, 27)))
    dates.push(pad(new Date(year, 11, 28)))
  } else if (christmasDay === 5 && boxingDayOfWeek === 6) {
    dates.push(pad(new Date(year, 11, 25)))
    dates.push(pad(new Date(year, 11, 28)))
  } else if (boxingDayOfWeek === 0) {
    dates.push(pad(new Date(year, 11, 25)))
    dates.push(pad(new Date(year, 11, 28)))
  } else if (boxingDayOfWeek === 6) {
    dates.push(pad(new Date(year, 11, 25)))
    dates.push(pad(new Date(year, 11, 28)))
  } else {
    dates.push(pad(new Date(year, 11, 25)))
    dates.push(pad(new Date(year, 11, 26)))
  }

  return dates
}

const cache = new Map<number, Set<string>>()

function getBankHolidaySet(year: number): Set<string> {
  if (!cache.has(year)) {
    const dates = getBankHolidaysForYear(year)
    cache.set(
      year,
      new Set(dates.map((d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`))
    )
  }
  return cache.get(year)!
}

/** Check if a date is a UK bank holiday (England & Wales) */
export function isUKBankHoliday(date: Date): boolean {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const year = d.getFullYear()
  return getBankHolidaySet(year).has(key)
}
