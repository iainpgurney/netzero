type HolidayRequestSlackPayload = {
  entryId: string
  employeeName: string
  employeeEmail: string | null
  managerName: string | null
  managerEmail: string | null
  leaveType: string
  startDate: Date
  endDate: Date
  numberOfDays: number
  reason: string
  action: 'submitted' | 'manager_changed'
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function buildHolidayRequestPayload(input: HolidayRequestSlackPayload) {
  const actionLabel =
    input.action === 'submitted'
      ? 'New holiday request submitted'
      : 'Holiday request manager changed'
  const managerLine = input.managerName
    ? `${input.managerName}${input.managerEmail ? ` (${input.managerEmail})` : ''}`
    : input.managerEmail ?? 'Unknown manager'

  const textLines = [
    `*${actionLabel}*`,
    `*Employee:* ${input.employeeName}${input.employeeEmail ? ` (${input.employeeEmail})` : ''}`,
    `*Manager:* ${managerLine}`,
    `*Leave type:* ${input.leaveType}`,
    `*Dates:* ${formatDate(input.startDate)} - ${formatDate(input.endDate)} (${input.numberOfDays} days)`,
    `*Reason:* ${input.reason}`,
    `*Request ID:* \`${input.entryId}\``,
  ]

  return {
    text: `Holiday request ${input.action}: ${input.employeeName}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: textLines.join('\n'),
        },
      },
    ],
  }
}

export async function notifyHolidayRequestSlack(input: HolidayRequestSlackPayload): Promise<void> {
  const webhookUrl = process.env.HOLIDAYREQUEST_SLACK_WEBHOOK_URL
  if (!webhookUrl) return

  const payload = buildHolidayRequestPayload(input)
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Holidayrequest Slack webhook failed: ${res.status} ${text}`)
  }
}
