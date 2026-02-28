import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import {
  generateImpactProfile,
  generatePairComparison,
  generateTeamAwarenessTips,
} from '@/lib/impact-alignment-llm'

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000
const SIX_MONTHS_MS = 6 * 30 * 24 * 60 * 60 * 1000

export const impactAlignmentRouter = router({
  getMyProfile: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id

    const profile = await ctx.prisma.impactProfile.findUnique({
      where: { userId },
      include: {
        assessment: true,
      },
    })

    return profile
  }),

  getAssessmentHistory: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id
    const assessments = await ctx.prisma.impactAssessment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        strategistScore: true,
        ideasScore: true,
        executionScore: true,
        peopleScore: true,
        excellenceScore: true,
        createdAt: true,
      },
    })
    return assessments
  }),

  canReassess: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id

    const latest = await ctx.prisma.impactAssessment.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    if (!latest) return { canReassess: true, nextDate: null }

    const nextDate = new Date(latest.createdAt.getTime() + SIX_MONTHS_MS)
    return {
      canReassess: new Date() >= nextDate,
      nextDate: nextDate.toISOString(),
    }
  }),

  submitAssessment: protectedProcedure
    .input(
      z.object({
        answers: z.array(z.number().min(1).max(10)).length(30),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      // Server-side 6-month cooldown enforcement
      const latestAssessment = await ctx.prisma.impactAssessment.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      })
      if (latestAssessment) {
        const nextDate = new Date(latestAssessment.createdAt.getTime() + SIX_MONTHS_MS)
        if (new Date() < nextDate) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: `You can reassess after ${nextDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}. Assessments are limited to once every 6 months.`,
          })
        }
      }

      const strategist = input.answers.slice(0, 6)
      const ideas = input.answers.slice(6, 12)
      const execution = input.answers.slice(12, 18)
      const people = input.answers.slice(18, 24)
      const excellence = input.answers.slice(24, 30)

      const avg = (arr: number[]) =>
        Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10

      const strategistScore = avg(strategist)
      const ideasScore = avg(ideas)
      const executionScore = avg(execution)
      const peopleScore = avg(people)
      const excellenceScore = avg(excellence)

      const user = await ctx.prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, jobTitle: true, departmentId: true },
      })

      let teamAverages: { strategist: number; ideas: number; execution: number; people: number; excellence: number } | undefined
      let teamMemberProfiles: Array<{ name: string; strategist: number; ideas: number; execution: number; people: number; excellence: number }> | undefined
      if (user?.departmentId) {
        const teamProfiles = await ctx.prisma.impactProfile.findMany({
          where: {
            user: { departmentId: user.departmentId },
            userId: { not: userId },
          },
          include: { assessment: true, user: { select: { name: true } } },
        })
        if (teamProfiles.length > 0) {
          teamAverages = {
            strategist: avg(teamProfiles.map((p) => p.assessment.strategistScore)),
            ideas: avg(teamProfiles.map((p) => p.assessment.ideasScore)),
            execution: avg(teamProfiles.map((p) => p.assessment.executionScore)),
            people: avg(teamProfiles.map((p) => p.assessment.peopleScore)),
            excellence: avg(teamProfiles.map((p) => p.assessment.excellenceScore)),
          }
          teamMemberProfiles = teamProfiles.map((p) => ({
            name: p.user.name || 'Unknown',
            strategist: p.assessment.strategistScore,
            ideas: p.assessment.ideasScore,
            execution: p.assessment.executionScore,
            people: p.assessment.peopleScore,
            excellence: p.assessment.excellenceScore,
          }))
        }
      }

      // Generate LLM narrative BEFORE creating DB records to prevent orphans
      const assessmentDate = new Date().toISOString().slice(0, 10)

      const narrative = await generateImpactProfile({
        userName: user?.name || 'Team Member',
        roleTitle: user?.jobTitle || 'Team Member',
        assessmentDate,
        strategistScore,
        ideasScore,
        executionScore,
        peopleScore,
        excellenceScore,
        teamAverages,
        teamMemberProfiles,
      })

      // Now create assessment and profile together
      const assessment = await ctx.prisma.impactAssessment.create({
        data: {
          userId,
          strategistScore,
          ideasScore,
          executionScore,
          peopleScore,
          excellenceScore,
          rawAnswers: input.answers,
        },
      })

      const previousAssessment = await ctx.prisma.impactAssessment.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: 1,
      })
      const significantShiftDetected =
        previousAssessment &&
        (Math.abs(strategistScore - previousAssessment.strategistScore) > 3 ||
          Math.abs(ideasScore - previousAssessment.ideasScore) > 3 ||
          Math.abs(executionScore - previousAssessment.executionScore) > 3 ||
          Math.abs(peopleScore - previousAssessment.peopleScore) > 3 ||
          Math.abs(excellenceScore - previousAssessment.excellenceScore) > 3)

      const now = new Date()
      const editLockedUntil = new Date(now.getTime() + TWENTY_FOUR_HOURS_MS)
      const narrativeObj = narrative as { energyMapSummary?: string }
      const headlineSummary = narrativeObj.energyMapSummary ?? ''

      const existingProfile = await ctx.prisma.impactProfile.findUnique({
        where: { userId },
      })

      const profile = await ctx.prisma.impactProfile.upsert({
        where: { userId },
        create: {
          userId,
          assessmentId: assessment.id,
          narrativeJson: narrative as object,
          headlineSummary,
          lastGeneratedAt: now,
          editLockedUntil,
        },
        update: {
          assessmentId: assessment.id,
          narrativeJson: narrative as object,
          headlineSummary,
          lastGeneratedAt: now,
          editLockedUntil,
          version: existingProfile ? existingProfile.version + 1 : 1,
        },
      })

      return { profile, assessment, significantShiftDetected: !!significantShiftDetected }
    }),

  getTeamProfiles: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id
    const user = await ctx.prisma.user.findUnique({
      where: { id: userId },
      select: { departmentId: true },
    })

    if (!user?.departmentId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'You must belong to a department to view team profiles.',
      })
    }

    const profiles = await ctx.prisma.impactProfile.findMany({
      where: {
        user: { departmentId: user.departmentId },
      },
      include: {
        assessment: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            jobTitle: true,
          },
        },
      },
      orderBy: { user: { name: 'asc' } },
    })

    return profiles
  }),

  getTeamAverages: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id
    const user = await ctx.prisma.user.findUnique({
      where: { id: userId },
      select: { departmentId: true },
    })

    if (!user?.departmentId) return null

    const profiles = await ctx.prisma.impactProfile.findMany({
      where: {
        user: { departmentId: user.departmentId },
      },
      include: { assessment: true },
    })

    if (profiles.length === 0) return null

    const avg = (arr: number[]) =>
      Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10

    const averages = {
      strategist: avg(profiles.map((p) => p.assessment.strategistScore)),
      ideas: avg(profiles.map((p) => p.assessment.ideasScore)),
      execution: avg(profiles.map((p) => p.assessment.executionScore)),
      people: avg(profiles.map((p) => p.assessment.peopleScore)),
      excellence: avg(profiles.map((p) => p.assessment.excellenceScore)),
    }

    const tips = generateTeamAwarenessTips(averages)

    return { averages, tips, memberCount: profiles.length }
  }),

  getPairComparison: protectedProcedure
    .input(
      z.object({
        userId1: z.string(),
        userId2: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const currentUser = ctx.session.user.id
      const currentUserData = await ctx.prisma.user.findUnique({
        where: { id: currentUser },
        select: { departmentId: true },
      })

      const [profile1, profile2] = await Promise.all([
        ctx.prisma.impactProfile.findUnique({
          where: { userId: input.userId1 },
          include: {
            assessment: true,
            user: { select: { name: true, departmentId: true } },
          },
        }),
        ctx.prisma.impactProfile.findUnique({
          where: { userId: input.userId2 },
          include: {
            assessment: true,
            user: { select: { name: true, departmentId: true } },
          },
        }),
      ])

      if (!profile1 || !profile2) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Both users must have completed their Impact Alignment assessment.',
        })
      }

      if (
        profile1.user.departmentId !== currentUserData?.departmentId ||
        profile2.user.departmentId !== currentUserData?.departmentId
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only compare members within your own department.',
        })
      }

      const result = await generatePairComparison({
        person1: {
          name: profile1.user.name || 'Person 1',
          strategist: profile1.assessment.strategistScore,
          ideas: profile1.assessment.ideasScore,
          execution: profile1.assessment.executionScore,
          people: profile1.assessment.peopleScore,
          excellence: profile1.assessment.excellenceScore,
        },
        person2: {
          name: profile2.user.name || 'Person 2',
          strategist: profile2.assessment.strategistScore,
          ideas: profile2.assessment.ideasScore,
          execution: profile2.assessment.executionScore,
          people: profile2.assessment.peopleScore,
          excellence: profile2.assessment.excellenceScore,
        },
      })

      return result
    }),
})
