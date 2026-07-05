export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  grade: string;
  enrollmentDate: string;
  overallProgress: number;
  streak: number;
}

export interface StudentCourse {
  id: string;
  name: string;
  progress: number;
  grade: string;
  nextLesson: string;
  icon: string;
}

export interface StudentAssignment {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  status: string;
  priority: string;
}

export interface StudentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
}

export interface StudentStats {
  totalHoursLearned: number;
  questionsAnswered: number;
  averageScore: number;
  coursesEnrolled: number;
  assignmentsCompleted: number;
  assignmentsPending: number;
}

export interface StudentDashboardData {
  profile: StudentProfile;
  courses: StudentCourse[];
  assignments: StudentAssignment[];
  recentActivities: StudentActivity[];
  stats: StudentStats;
}
