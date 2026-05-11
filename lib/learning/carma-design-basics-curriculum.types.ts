export type CurriculumQuiz = {
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
  order: number
}

export type CurriculumModule = {
  order: number
  title: string
  description: string
  duration: number
  badgeName: string
  badgeEmoji: string
  content: { sections: { title: string; content: string }[]; keyTakeaways: string[] }
  quizzes: CurriculumQuiz[]
}

export type CurriculumBundle = {
  course: {
    slug: string
    title: string
    description: string
    icon: string
    isActive: boolean
  }
  modules: CurriculumModule[]
}
