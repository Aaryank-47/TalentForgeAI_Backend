import prisma from '../src/config/database';
async function run() {
  const assignments = await prisma.interviewAssignment.findMany({
    include: {
      application: { include: { candidate: { include: { user: true } } } },
      interview: true
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  console.log("== ASSIGNMENTS ==");
  console.log(JSON.stringify(assignments.map(a => ({
    id: a.id,
    candEmail: a.application?.candidate?.user?.email,
    intTitle: a.interview?.title,
    intType: a.interview?.type
  })), null, 2));

  const sessions = await prisma.interviewSession.findMany({
    include: {
        participants: {
            include: {
                assignment: { include: { application: { include: { candidate: { include: { user: true } } } } } }
            }
        },
        interview: true
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  console.log("== SESSIONS ==");
  console.log(JSON.stringify(sessions.map(s => ({
    id: s.id,
    intTitle: s.interview?.title,
    participants: s.participants.map(p => ({
        type: p.participantType,
        email: p.assignment?.application?.candidate?.user?.email || 'N/A'
    }))
  })), null, 2));

}
run();
