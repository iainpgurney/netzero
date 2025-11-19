import { redirect } from 'next/navigation'

// Redirect old learning hub to courses page
export default async function LearningHubPage() {
  redirect('/courses')
}

