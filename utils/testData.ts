export type ApplicantData = ReturnType<typeof createApplicantData>;

export function createApplicantData() {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const configuredEmail = process.env.TEST_EMAIL?.trim();
  return {
    email: configuredEmail || `shraddha.sdet+${id}@example.com`,
    password: process.env.TEST_PASSWORD || 'Kaleidoscope@2026',
    firstName: 'Shraddha',
    lastName: `SDET${id.slice(-6)}`,
    phone: '4155550132',
    address: '100 Automation Avenue',
    city: 'Pune',
    state: 'Maharashtra',
    postalCode: '411001',
    school: 'Automation Engineering School',
    graduationYear: '2027',
    gpa: '3.8',
    activities: [
      'Robotics Club - Team Lead',
      'Community Tutoring - Volunteer',
      'School Debate Team - Member',
      'Open Source Club - Contributor'
    ],
    animalEssay: 'Animals teach patience, responsibility, and empathy. Volunteering at a local shelter showed me how consistent care can turn uncertainty into trust, and I apply that lesson when collaborating with classmates and solving difficult problems.',
    schoolEssay: 'School gives me a structured place to challenge assumptions, learn from different perspectives, and turn curiosity into practical skills. I plan to use those skills to build reliable technology that improves access to education.'
  };
}
