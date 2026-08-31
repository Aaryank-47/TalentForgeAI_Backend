import { AnalyticsRepository } from "../repository/analytics.repository.js";
import { JobStatus, ApplicationStatus, AIRecommendation, InterviewSessionStatus } from "@prisma/client";
export class AnalyticsService {
    static parsePeriod(periodStr) {
        const now = new Date();
        let days = 180;
        let periodLabel = "Last 6 Months";
        if (periodStr === "30d" || periodStr === "Last 30 Days") {
            days = 30;
            periodLabel = "Last 30 Days";
        }
        else if (periodStr === "3m" || periodStr === "Last 3 Months") {
            days = 90;
            periodLabel = "Last 3 Months";
        }
        else if (periodStr === "6m" || periodStr === "Last 6 Months") {
            days = 180;
            periodLabel = "Last 6 Months";
        }
        else if (periodStr === "1y" || periodStr === "This Year") {
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            const diffTime = Math.abs(now.getTime() - startOfYear.getTime());
            days = Math.max(30, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
            periodLabel = "This Year";
        }
        const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        const previousEndDate = new Date(startDate.getTime());
        const previousStartDate = new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000);
        const monthCount = Math.max(1, Math.round(days / 30));
        return { startDate, previousStartDate, previousEndDate, monthCount, periodLabel };
    }
    static async getOverview(companyId, periodQuery) {
        const { startDate, previousStartDate, previousEndDate, monthCount, periodLabel } = this.parsePeriod(periodQuery);
        const [jobs, applications, assessments, interviews] = await Promise.all([
            AnalyticsRepository.getCompanyJobs(companyId),
            AnalyticsRepository.getCompanyApplications(companyId, previousStartDate),
            AnalyticsRepository.getCompanyAssessments(companyId),
            AnalyticsRepository.getCompanyInterviews(companyId),
        ]);
        const currentApps = applications.filter((a) => new Date(a.appliedAt) >= startDate);
        const prevApps = applications.filter((a) => new Date(a.appliedAt) >= previousStartDate && new Date(a.appliedAt) < startDate);
        const currentHiredApps = currentApps.filter((a) => a.status === ApplicationStatus.HIRED && a.hiredAt);
        const prevHiredApps = prevApps.filter((a) => a.status === ApplicationStatus.HIRED && a.hiredAt);
        const calcAvgDaysToHire = (apps) => {
            if (apps.length === 0)
                return 0;
            const totalDays = apps.reduce((sum, app) => {
                const diffMs = new Date(app.hiredAt).getTime() - new Date(app.appliedAt).getTime();
                return sum + Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
            }, 0);
            return Math.round(totalDays / apps.length);
        };
        const currentTTH = calcAvgDaysToHire(currentHiredApps);
        const prevTTH = calcAvgDaysToHire(prevHiredApps);
        let tthTrend = "0%";
        let tthPositive = true;
        if (prevTTH > 0 && currentTTH > 0) {
            const diff = Math.round(((currentTTH - prevTTH) / prevTTH) * 100);
            tthTrend = `${diff > 0 ? "+" : ""}${diff}%`;
            tthPositive = diff <= 0;
        }
        const openJobsCount = jobs.filter((j) => j.status === JobStatus.PUBLISHED).length;
        const prevOpenJobs = jobs.filter((j) => new Date(j.createdAt) < startDate && (j.status === JobStatus.PUBLISHED || (j.closedAt && new Date(j.closedAt) >= startDate))).length;
        const openDiff = openJobsCount - prevOpenJobs;
        const openJobsTrend = `${openDiff >= 0 ? "+" : ""}${openDiff}`;
        const totalHires = currentHiredApps.length;
        const prevHires = prevHiredApps.length;
        let hiresTrend = "+0%";
        let hiresPositive = true;
        if (prevHires > 0) {
            const hireDiff = Math.round(((totalHires - prevHires) / prevHires) * 100);
            hiresTrend = `${hireDiff > 0 ? "+" : ""}${hireDiff}%`;
            hiresPositive = hireDiff >= 0;
        }
        else if (totalHires > 0) {
            hiresTrend = `+${totalHires}`;
            hiresPositive = true;
        }
        const offeredApps = currentApps.filter((a) => {
            const stageName = a.applicationWorkflow?.workflowStage?.stageLibrary?.name?.toLowerCase() ?? "";
            return a.status === ApplicationStatus.HIRED || stageName.includes("offer");
        });
        const offerAcceptancePct = offeredApps.length > 0 ? Math.round((totalHires / offeredApps.length) * 100) : totalHires > 0 ? 100 : 0;
        let totalEvaluations = 0;
        let successfulEvaluations = 0;
        for (const interview of interviews) {
            for (const session of interview.sessions) {
                for (const evalItem of session.evaluations) {
                    totalEvaluations++;
                    if (evalItem.recommendation === AIRecommendation.STRONG_HIRE ||
                        evalItem.recommendation === AIRecommendation.HIRE ||
                        evalItem.overallScore >= 70) {
                        successfulEvaluations++;
                    }
                }
            }
        }
        const interviewSuccessPct = totalEvaluations > 0 ? Math.round((successfulEvaluations / totalEvaluations) * 100) : 0;
        const kpis = {
            timeToHire: {
                value: currentTTH > 0 ? `${currentTTH} Days` : "0 Days",
                trend: tthTrend,
                positive: tthPositive,
            },
            openJobs: {
                value: `${openJobsCount}`,
                trend: openJobsTrend,
                positive: true,
            },
            totalHires: {
                value: `${totalHires}`,
                trend: hiresTrend,
                positive: hiresPositive,
            },
            offerAcceptance: {
                value: `${offerAcceptancePct}%`,
                trend: "+0%",
                positive: true,
            },
            interviewSuccess: {
                value: `${interviewSuccessPct}%`,
                trend: "+0%",
                positive: true,
            },
        };
        const totalApplied = currentApps.length;
        let screeningCount = 0;
        let assessmentCount = 0;
        let aiInterviewCount = 0;
        let technicalCount = 0;
        let hrRoundCount = 0;
        let offeredCount = 0;
        const hiredCount = totalHires;
        for (const app of currentApps) {
            const stageName = (app.applicationWorkflow?.workflowStage?.stageLibrary?.name ?? "").toLowerCase();
            const hasAssessment = app.assessmentAttempts.length > 0;
            const hasInterview = app.interviewAssignments.length > 0;
            if (stageName.includes("screening") || stageName.includes("assessment") || stageName.includes("interview") || stageName.includes("offer") || app.status === ApplicationStatus.HIRED || hasAssessment || hasInterview) {
                screeningCount++;
            }
            if (hasAssessment || stageName.includes("assessment") || stageName.includes("interview") || stageName.includes("offer") || app.status === ApplicationStatus.HIRED) {
                assessmentCount++;
            }
            const aiAssign = app.interviewAssignments.some((ia) => ia.interview?.type === "AI" || ia.interview?.title?.toLowerCase().includes("ai"));
            if (aiAssign || stageName.includes("ai") || stageName.includes("technical") || stageName.includes("hr") || stageName.includes("offer") || app.status === ApplicationStatus.HIRED) {
                aiInterviewCount++;
            }
            const techAssign = app.interviewAssignments.some((ia) => ia.interview?.type === "NORMAL" || ia.interview?.title?.toLowerCase().includes("tech"));
            if (techAssign || stageName.includes("tech") || stageName.includes("hr") || stageName.includes("offer") || app.status === ApplicationStatus.HIRED) {
                technicalCount++;
            }
            if (stageName.includes("hr") || stageName.includes("offer") || app.status === ApplicationStatus.HIRED) {
                hrRoundCount++;
            }
            if (stageName.includes("offer") || app.status === ApplicationStatus.HIRED) {
                offeredCount++;
            }
        }
        const funnelData = [
            { stage: "Applied", count: totalApplied, color: "#2563EB" },
            { stage: "Screening", count: Math.min(totalApplied, Math.max(screeningCount, assessmentCount)), color: "#3B82F6" },
            { stage: "Assessment", count: Math.min(screeningCount || totalApplied, assessmentCount), color: "#60A5FA" },
            { stage: "AI Interview", count: Math.min(assessmentCount || totalApplied, aiInterviewCount), color: "#818CF8" },
            { stage: "Technical", count: Math.min(aiInterviewCount || totalApplied, technicalCount), color: "#A78BFA" },
            { stage: "HR Round", count: Math.min(technicalCount || totalApplied, hrRoundCount), color: "#C084FC" },
            { stage: "Offered", count: Math.min(hrRoundCount || totalApplied, offeredCount), color: "#22C55E" },
            { stage: "Hired", count: hiredCount, color: "#16A34A" },
        ];
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const now = new Date();
        const timeToHireData = [];
        const jobsFilledData = [];
        for (let i = monthCount - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const mName = monthNames[d.getMonth()];
            const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1);
            const mHiredApps = applications.filter((a) => {
                if (a.status !== ApplicationStatus.HIRED || !a.hiredAt)
                    return false;
                const hDate = new Date(a.hiredAt);
                return hDate >= d && hDate < nextMonth;
            });
            const mDays = calcAvgDaysToHire(mHiredApps);
            timeToHireData.push({ name: mName, days: mDays });
            const mOpenedJobs = jobs.filter((j) => {
                const jDate = new Date(j.createdAt);
                return jDate >= d && jDate < nextMonth;
            }).length;
            const mFilledJobs = jobs.filter((j) => {
                if (!j.closedAt && j.status !== JobStatus.FILLED)
                    return false;
                const cDate = new Date(j.closedAt ?? j.createdAt);
                return cDate >= d && cDate < nextMonth;
            }).length + mHiredApps.length;
            jobsFilledData.push({ month: mName, open: mOpenedJobs, filled: mFilledJobs });
        }
        const isFaster = tthPositive;
        const timeToHireSummary = {
            comparisonText: currentTTH > 0 ? `${Math.abs(parseInt(tthTrend, 10) || 0)}% ${isFaster ? "faster" : "slower"}` : "No hiring recorded",
            isFaster,
        };
        const sourceCounts = {
            LinkedIn: 0,
            "Career Page": 0,
            GitHub: 0,
            Portfolio: 0,
            Direct: 0,
        };
        for (const app of currentApps) {
            if (app.candidate.linkedinUrl) {
                sourceCounts["LinkedIn"] = (sourceCounts["LinkedIn"] ?? 0) + 1;
            }
            else if (app.candidate.githubUrl) {
                sourceCounts["GitHub"] = (sourceCounts["GitHub"] ?? 0) + 1;
            }
            else if (app.candidate.portfolioUrl || app.candidate.websiteUrl) {
                sourceCounts["Portfolio"] = (sourceCounts["Portfolio"] ?? 0) + 1;
            }
            else {
                sourceCounts["Direct"] = (sourceCounts["Direct"] ?? 0) + 1;
            }
        }
        const totalSources = Object.values(sourceCounts).reduce((a, b) => a + b, 0);
        const sourceColorMap = {
            LinkedIn: "#0077B5",
            "Career Page": "#2563EB",
            GitHub: "#333333",
            Portfolio: "#FF5722",
            Direct: "#22C55E",
        };
        const sourceData = Object.entries(sourceCounts)
            .map(([name, count]) => ({
            name,
            count,
            value: totalSources > 0 ? Math.round((count / totalSources) * 100) : 0,
            color: sourceColorMap[name] || "#64748B",
        }))
            .filter((s) => s.count > 0);
        if (sourceData.length === 0) {
            sourceData.push({ name: "Direct", count: 0, value: 0, color: "#2563EB" });
        }
        const interviewSuccessData = [];
        const interviewTypeStats = {};
        for (const interview of interviews) {
            const typeName = interview.type === "AI" ? "AI Interview" : interview.title || "Technical";
            if (!interviewTypeStats[typeName]) {
                interviewTypeStats[typeName] = { total: 0, success: 0 };
            }
            for (const session of interview.sessions) {
                for (const ev of session.evaluations) {
                    interviewTypeStats[typeName].total++;
                    if (ev.recommendation === AIRecommendation.STRONG_HIRE ||
                        ev.recommendation === AIRecommendation.HIRE ||
                        ev.overallScore >= 70) {
                        interviewTypeStats[typeName].success++;
                    }
                }
            }
        }
        for (const [name, stat] of Object.entries(interviewTypeStats)) {
            if (stat.total > 0) {
                const successPct = Math.round((stat.success / stat.total) * 100);
                interviewSuccessData.push({
                    name,
                    success: successPct,
                    rejected: 100 - successPct,
                });
            }
        }
        if (interviewSuccessData.length === 0) {
            interviewSuccessData.push({ name: "AI Interview", success: 0, rejected: 0 }, { name: "Technical", success: 0, rejected: 0 });
        }
        const assessmentPerfData = assessments.map((assessment) => {
            const attemptsCount = assessment.attempts.length;
            const avgScore = attemptsCount > 0
                ? Math.round(assessment.attempts.reduce((sum, att) => sum + (att.percentage ?? att.overallScore ?? 0), 0) /
                    attemptsCount)
                : 0;
            return {
                name: assessment.title,
                attempts: attemptsCount,
                avg: avgScore,
            };
        });
        return {
            period: periodLabel,
            kpis,
            funnelData,
            timeToHireData,
            timeToHireSummary,
            sourceData,
            interviewSuccessData,
            jobsFilledData,
            assessmentPerfData,
        };
    }
    static async getDashboard(companyId, timeframeQuery = "7d") {
        const is30Days = timeframeQuery === "30d" || timeframeQuery === "Last 30 days";
        const daysCount = is30Days ? 30 : 7;
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const [jobs, applications, assessments, interviews] = await Promise.all([
            AnalyticsRepository.getCompanyJobs(companyId),
            AnalyticsRepository.getCompanyApplications(companyId),
            AnalyticsRepository.getCompanyAssessments(companyId),
            AnalyticsRepository.getCompanyInterviews(companyId),
        ]);
        // ─── KPIs ───────────────────────────────────────────────────────────────
        // Open Jobs
        const openJobsCount = jobs.filter((j) => j.status === JobStatus.PUBLISHED).length;
        const jobsOpenedLastMonth = jobs.filter((j) => j.status === JobStatus.PUBLISHED && new Date(j.createdAt) >= thirtyDaysAgo).length;
        const openJobsKpi = {
            title: "Open Jobs",
            value: `${openJobsCount}`,
            change: jobsOpenedLastMonth > 0 ? `+${jobsOpenedLastMonth} from last month` : "Active positions",
            trend: "up",
        };
        // Applicants This Week
        const appsThisWeek = applications.filter((a) => new Date(a.appliedAt) >= sevenDaysAgo).length;
        const appsPrevWeek = applications.filter((a) => new Date(a.appliedAt) >= fourteenDaysAgo && new Date(a.appliedAt) < sevenDaysAgo).length;
        let appsWeekChange = "+0% vs last week";
        let appsWeekTrend = "up";
        if (appsPrevWeek > 0) {
            const diff = Math.round(((appsThisWeek - appsPrevWeek) / appsPrevWeek) * 100);
            appsWeekChange = `${diff >= 0 ? "+" : ""}${diff}% vs last week`;
            appsWeekTrend = diff >= 0 ? "up" : "warn";
        }
        else if (appsThisWeek > 0) {
            appsWeekChange = `+${appsThisWeek} new this week`;
            appsWeekTrend = "up";
        }
        const applicantsThisWeekKpi = {
            title: "Applicants This Week",
            value: `${appsThisWeek}`,
            change: appsWeekChange,
            trend: appsWeekTrend,
        };
        // Pending Reviews
        const pendingApps = applications.filter((a) => a.status === ApplicationStatus.APPLIED || a.status === ApplicationStatus.INREVIEW);
        const pendingToday = applications.filter((a) => (a.status === ApplicationStatus.APPLIED || a.status === ApplicationStatus.INREVIEW) && new Date(a.appliedAt) >= startOfToday).length;
        const pendingReviewsKpi = {
            title: "Pending Reviews",
            value: `${pendingApps.length}`,
            change: pendingToday > 0 ? `${pendingToday} need action today` : `${pendingApps.length} in pipeline`,
            trend: pendingApps.length > 0 ? "warn" : "up",
        };
        // Today's Interviews
        let todaysInterviewsCount = 0;
        const allSessions = [];
        for (const iv of interviews) {
            for (const sess of iv.sessions) {
                const sched = new Date(sess.scheduledAt);
                const started = sess.startedAt ? new Date(sess.startedAt) : null;
                const ended = sess.endedAt ? new Date(sess.endedAt) : null;
                const participant = sess.participants.find((p) => p.participantType === "CANDIDATE")?.assignment?.application;
                const candidateName = participant?.candidate?.fullName || "Candidate";
                const jobTitle = participant?.job?.title || iv.title || "Interview";
                let score = null;
                if (sess.evaluations && sess.evaluations.length > 0 && typeof sess.evaluations[0]?.overallScore === 'number') {
                    score = sess.evaluations[0].overallScore;
                }
                else if (sess.aiResult && typeof sess.aiResult.overallScore === 'number') {
                    score = sess.aiResult.overallScore;
                }
                allSessions.push({
                    id: sess.id,
                    title: iv.title,
                    type: iv.type === "AI" ? "AI Interview" : "Technical",
                    scheduledAt: sched,
                    startedAt: started,
                    endedAt: ended,
                    status: sess.status,
                    candidateName,
                    jobTitle,
                    durationMinutes: iv.durationMinutes ?? null,
                    overallScore: score,
                });
                if (sched >= startOfToday && sched <= endOfToday) {
                    todaysInterviewsCount++;
                }
            }
        }
        const todaysInterviewsKpi = {
            title: "Today's Interviews",
            value: `${todaysInterviewsCount}`,
            change: todaysInterviewsCount > 0 ? "Scheduled for today" : "No sessions today",
            trend: "up",
        };
        // ─── Application Volume Chart ──────────────────────────────────────────
        const applicationVolume = [];
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        for (let i = daysCount - 1; i >= 0; i--) {
            const dayStart = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dayStartBoundary = new Date(dayStart.getFullYear(), dayStart.getMonth(), dayStart.getDate(), 0, 0, 0);
            const dayEndBoundary = new Date(dayStart.getFullYear(), dayStart.getMonth(), dayStart.getDate(), 23, 59, 59);
            const dayLabel = daysCount <= 7 ? dayNames[dayStart.getDay()] : `${dayStart.getMonth() + 1}/${dayStart.getDate()}`;
            const dayApplicants = applications.filter((a) => {
                const appDate = new Date(a.appliedAt);
                return appDate >= dayStartBoundary && appDate <= dayEndBoundary;
            }).length;
            const dayInterviews = allSessions.filter((s) => {
                return s.scheduledAt >= dayStartBoundary && s.scheduledAt <= dayEndBoundary;
            }).length;
            applicationVolume.push({
                name: dayLabel,
                applicants: dayApplicants,
                interviews: dayInterviews,
            });
        }
        // ─── Pipeline Health ───────────────────────────────────────────────────
        const totalApplied = applications.length;
        let screeningCount = 0;
        let assessmentCount = 0;
        let interviewStageCount = 0;
        let offerCount = 0;
        let hiredCount = 0;
        for (const app of applications) {
            const stageName = (app.applicationWorkflow?.workflowStage?.stageLibrary?.name ?? "").toLowerCase();
            if (stageName.includes("screen") || stageName.includes("assess") || stageName.includes("interview") || stageName.includes("offer") || app.status === ApplicationStatus.HIRED) {
                screeningCount++;
            }
            if (app.assessmentAttempts.length > 0 || stageName.includes("assess") || stageName.includes("interview") || stageName.includes("offer") || app.status === ApplicationStatus.HIRED) {
                assessmentCount++;
            }
            if (app.interviewAssignments.length > 0 || stageName.includes("interview") || stageName.includes("offer") || app.status === ApplicationStatus.HIRED) {
                interviewStageCount++;
            }
            if (stageName.includes("offer") || app.status === ApplicationStatus.HIRED) {
                offerCount++;
            }
            if (app.status === ApplicationStatus.HIRED) {
                hiredCount++;
            }
        }
        const calcPct = (cnt) => (totalApplied > 0 ? Math.round((cnt / totalApplied) * 100) : 0);
        const pipelineStages = [
            { stage: "Applied", count: totalApplied, color: "#2563EB", pct: totalApplied > 0 ? 100 : 0 },
            { stage: "Screening", count: screeningCount, color: "#3B82F6", pct: calcPct(screeningCount) },
            { stage: "Assessment", count: assessmentCount, color: "#60A5FA", pct: calcPct(assessmentCount) },
            { stage: "Interview", count: interviewStageCount, color: "#93C5FD", pct: calcPct(interviewStageCount) },
            { stage: "Offer", count: offerCount, color: "#22C55E", pct: calcPct(offerCount) },
            { stage: "Hired", count: hiredCount, color: "#16A34A", pct: calcPct(hiredCount) },
        ];
        // ─── Upcoming Interviews (Scheduled or In-Progress today onwards) ──────
        const upcomingSessions = allSessions
            .filter((s) => (s.status === InterviewSessionStatus.SCHEDULED || s.status === InterviewSessionStatus.IN_PROGRESS) && s.scheduledAt >= startOfToday)
            .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
            .slice(0, 4);
        const avatarGradients = [
            "from-blue-500 to-blue-700",
            "from-purple-500 to-purple-700",
            "from-emerald-500 to-emerald-700",
            "from-amber-500 to-amber-700",
        ];
        const upcomingInterviews = upcomingSessions.map((s, i) => {
            const initials = s.candidateName
                .split(" ")
                .map((p) => p[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) || "C";
            const isToday = s.scheduledAt >= startOfToday && s.scheduledAt <= endOfToday;
            const isTomorrow = s.scheduledAt > endOfToday &&
                s.scheduledAt.getTime() <= endOfToday.getTime() + 24 * 60 * 60 * 1000;
            let timeFormatted = `${s.scheduledAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
            if (isToday) {
                timeFormatted = `Today, ${timeFormatted}`;
            }
            else if (isTomorrow) {
                timeFormatted = `Tomorrow, ${timeFormatted}`;
            }
            else {
                timeFormatted = `${s.scheduledAt.toLocaleDateString([], { month: "short", day: "numeric" })}, ${timeFormatted}`;
            }
            return {
                id: s.id,
                name: s.candidateName,
                role: s.jobTitle,
                time: timeFormatted,
                type: s.type,
                avatar: initials,
                color: avatarGradients[i % avatarGradients.length],
            };
        });
        // ─── Interview Summary (Real Historical DB Metrics) ───────────────────
        const totalSessionsCount = allSessions.length;
        const completedSessionsCount = allSessions.filter((s) => s.status === InterviewSessionStatus.COMPLETED).length;
        const scheduledSessionsCount = allSessions.filter((s) => s.status === InterviewSessionStatus.SCHEDULED).length;
        const inProgressSessionsCount = allSessions.filter((s) => s.status === InterviewSessionStatus.IN_PROGRESS).length;
        const cancelledSessionsCount = allSessions.filter((s) => s.status === InterviewSessionStatus.CANCELLED || s.status === InterviewSessionStatus.EXPIRED).length;
        const completionRate = totalSessionsCount > 0 ? Math.round((completedSessionsCount / totalSessionsCount) * 100) : 0;
        let totalDurationMinutes = 0;
        let durationCount = 0;
        for (const sess of allSessions) {
            if (sess.status === InterviewSessionStatus.COMPLETED) {
                if (sess.startedAt && sess.endedAt) {
                    const diffMin = Math.round((sess.endedAt.getTime() - sess.startedAt.getTime()) / (1000 * 60));
                    if (diffMin > 0 && diffMin < 600) {
                        totalDurationMinutes += diffMin;
                        durationCount++;
                    }
                }
                else if (sess.durationMinutes && sess.durationMinutes > 0) {
                    totalDurationMinutes += sess.durationMinutes;
                    durationCount++;
                }
            }
        }
        const avgDurationMinutes = durationCount > 0 ? Math.round(totalDurationMinutes / durationCount) : null;
        let totalScoreSum = 0;
        let scoreCount = 0;
        for (const sess of allSessions) {
            if (sess.overallScore !== null && !isNaN(sess.overallScore)) {
                totalScoreSum += sess.overallScore;
                scoreCount++;
            }
        }
        const avgScore = scoreCount > 0 ? Math.round(totalScoreSum / scoreCount) : null;
        const interviewSummary = {
            totalInterviews: totalSessionsCount,
            completedCount: completedSessionsCount,
            scheduledCount: scheduledSessionsCount,
            inProgressCount: inProgressSessionsCount,
            cancelledCount: cancelledSessionsCount,
            completionRate,
            avgDurationMinutes,
            avgScore,
            hasAnyData: totalSessionsCount > 0 || interviews.length > 0,
        };
        // ─── Recent Activity ───────────────────────────────────────────────────
        const activityItems = [];
        // Applications
        applications.slice(0, 5).forEach((a) => {
            activityItems.push({
                id: `app-${a.id}`,
                type: "applied",
                text: `${a.candidate.fullName} applied for ${a.job?.title || "a job"}`,
                timestamp: new Date(a.appliedAt),
                color: "bg-blue-100 text-blue-700",
            });
            if (a.status === ApplicationStatus.HIRED && a.hiredAt) {
                activityItems.push({
                    id: `hire-${a.id}`,
                    type: "hired",
                    text: `${a.candidate.fullName} was hired for ${a.job?.title || "the role"}`,
                    timestamp: new Date(a.hiredAt),
                    color: "bg-emerald-100 text-emerald-700",
                });
            }
        });
        // Assessment completions
        assessments.forEach((ass) => {
            ass.attempts.forEach((att) => {
                if (att.submittedAt) {
                    activityItems.push({
                        id: `att-${att.id}`,
                        type: "assessment",
                        text: `${att.candidate?.fullName || "Candidate"} completed ${ass.title} (${Math.round(att.percentage ?? att.overallScore ?? 0)}%)`,
                        timestamp: new Date(att.submittedAt),
                        color: "bg-green-100 text-green-700",
                    });
                }
            });
        });
        // Interviews
        allSessions.forEach((sess) => {
            activityItems.push({
                id: `sess-${sess.id}`,
                type: "interview",
                text: `${sess.type} with ${sess.candidateName} (${sess.jobTitle})`,
                timestamp: sess.scheduledAt,
                color: "bg-purple-100 text-purple-700",
            });
        });
        activityItems.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        const formatRelativeTime = (d) => {
            const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
            if (diffSec < 0)
                return "Upcoming";
            if (diffSec < 60)
                return "Just now";
            if (diffSec < 3600)
                return `${Math.floor(diffSec / 60)} min ago`;
            if (diffSec < 86400)
                return `${Math.floor(diffSec / 3600)}h ago`;
            return `${Math.floor(diffSec / 86400)}d ago`;
        };
        const recentActivity = activityItems.slice(0, 6).map((item) => ({
            id: item.id,
            type: item.type,
            text: item.text,
            time: formatRelativeTime(item.timestamp),
            color: item.color,
        }));
        // ─── Active Job Pipelines ──────────────────────────────────────────────
        const activeJobs = jobs.filter((j) => j.status === JobStatus.PUBLISHED).slice(0, 5);
        const activeJobPipelines = activeJobs.map((j) => {
            const jobApps = j.applications;
            let jApplied = jobApps.length;
            let jScreening = 0;
            let jInterview = 0;
            let jOffer = 0;
            for (const app of jobApps) {
                const stName = (app.applicationWorkflow?.workflowStage?.stageLibrary?.name ?? "").toLowerCase();
                if (stName.includes("screen") || stName.includes("assess") || stName.includes("interview") || stName.includes("offer") || app.status === ApplicationStatus.HIRED) {
                    jScreening++;
                }
                if (stName.includes("interview") || stName.includes("offer") || app.status === ApplicationStatus.HIRED) {
                    jInterview++;
                }
                if (stName.includes("offer") || app.status === ApplicationStatus.HIRED) {
                    jOffer++;
                }
            }
            return {
                id: j.id,
                role: j.title,
                dept: "Engineering",
                stats: [jApplied, jScreening, jInterview, jOffer],
                status: "Active",
            };
        });
        // ─── Stats Footer ──────────────────────────────────────────────────────
        const hiredApps = applications.filter((a) => a.status === ApplicationStatus.HIRED && a.hiredAt);
        let avgDays = 0;
        if (hiredApps.length > 0) {
            const totalDays = hiredApps.reduce((sum, a) => {
                const diff = Math.max(1, Math.round((new Date(a.hiredAt).getTime() - new Date(a.appliedAt).getTime()) / (1000 * 60 * 60 * 24)));
                return sum + diff;
            }, 0);
            avgDays = Math.round(totalDays / hiredApps.length);
        }
        const offerAcceptRate = offerCount > 0 ? `${Math.round((hiredCount / offerCount) * 100)}%` : hiredCount > 0 ? "100%" : "0%";
        const avgTimeToHire = avgDays > 0 ? `${avgDays}d` : "0d";
        return {
            kpis: {
                openJobs: openJobsKpi,
                applicantsThisWeek: applicantsThisWeekKpi,
                pendingReviews: pendingReviewsKpi,
                todaysInterviews: todaysInterviewsKpi,
            },
            applicationVolume,
            pipelineStages,
            upcomingInterviews,
            interviewSummary,
            recentActivity,
            activeJobPipelines,
            statsFooter: {
                offerAcceptRate,
                avgTimeToHire,
            },
        };
    }
}
//# sourceMappingURL=analytics.service.js.map