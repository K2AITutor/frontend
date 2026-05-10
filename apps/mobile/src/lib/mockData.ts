// mobile/src/lib/mockData.ts

export const MOCK_STUDENT_DASHBOARD = {
  profile: {
    id: "dev-student",
    name: "Alex Nguyen",
    email: "alex.student@example.com",
    avatar: "",
    grade: "Year 12",
    enrollmentDate: new Date().toISOString(),
    overallProgress: 68,
    streak: 5,
  },
  courses: [
    {
      id: "math-methods",
      name: "Mathematical Methods",
      progress: 72,
      grade: "A",
      nextLesson: "Integration Rules",
      icon: "calculator",
    },
    {
      id: "physics",
      name: "Physics",
      progress: 45,
      grade: "B+",
      nextLesson: "Electric Fields",
      icon: "atom",
    },
    {
      id: "chemistry",
      name: "Chemistry",
      progress: 30,
      grade: "B",
      nextLesson: "Equilibrium",
      icon: "flask-conical",
    },
  ],
  assignments: [
    {
      id: "a1",
      title: "Methods Calculus Review",
      course: "Mathematical Methods",
      dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
      status: "pending",
      priority: "high",
    },
    {
      id: "a2",
      title: "Physics Problem Set 4",
      course: "Physics",
      dueDate: new Date(Date.now() + 4 * 86400000).toISOString(),
      status: "in_progress",
      priority: "medium",
    },
  ],
  recentActivities: [
    {
      id: "r1",
      type: "practice",
      title: "Practice Completed",
      description: "You finished 10 questions in Calculus",
      timestamp: new Date().toISOString(),
    },
    {
      id: "r2",
      type: "quiz_completed",
      title: "Quiz Ace!",
      description: "Scored 100% in Probability quiz",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  stats: {
    totalHoursLearned: 14,
    questionsAnswered: 156,
    averageScore: 78,
    coursesEnrolled: 3,
    assignmentsCompleted: 12,
    assignmentsPending: 2,
  },
};

export const MOCK_TOPICS = [
  { id: "1", name: "Functions & Graphs", progress: 72, icon: "book-open", strand: "Functions & Graphs" },
  { id: "2", name: "Algebra", progress: 45, icon: "clock", strand: "Algebra" },
  { id: "3", name: "Calculus", progress: 12, icon: "trophy", strand: "Calculus" },
  { id: "4", name: "Probability", progress: 85, icon: "bar-chart", strand: "Probability & Statistics" },
];
