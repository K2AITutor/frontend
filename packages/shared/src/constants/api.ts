export const PATH = {
  auth: {
    signin: "/auth/signin",
    signup: "/auth/signup",
    google: "/auth/google",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    verifyEmail: "/auth/verify-email",
    resendVerification: "/auth/resend-verification",
    completeProfile: "/auth/complete-profile",
    me: "/auth/me",
    refresh: "/auth/refresh",
    changePassword: "/auth/change-password",
  },
  billing: {
    plans: "/billing/plans",
    me: (userId: number) => `/billing/me/${userId}`,
    checkout: "/billing/checkout",
    cancel: (userId: number) => `/billing/cancel/${userId}`,
    invoices: (userId: number) => `/billing/invoices/${userId}`,
    usage: (userId: number) => `/billing/usage/${userId}`,
    iapAppleVerify: "/billing/iap/apple/verify",
    iapGoogleVerify: "/billing/iap/google/verify",
  },
  dashboard: {
    data: "/dashboard/data",
    student: "/dashboard",
    admin: "/admin/dashboard",
  },
  questions: {
    practice: "/questions/practice",
    submit: "/questions/submit",
    topicCounts: "/questions/topic-counts",
    recommendNext: "/questions/recommend-next",
    similar: "/questions/similar",
    drafts: "/questions/drafts",
    draftsMine: "/questions/drafts/mine",
    draftById: (id: number) => `/questions/drafts/${id}`,
    submitReview: (id: number) => `/questions/drafts/${id}/submit-review`,
  },
  exams: {
    byKey: (examKey: string) => `/exams/${encodeURIComponent(examKey)}`,
    questions: (examKey: string) =>
      `/exams/${encodeURIComponent(examKey)}/questions`,
    submit: (examKey: string) =>
      `/exams/${encodeURIComponent(examKey)}/submit`,
    meta: (examKey: string) =>
      `/exams/${encodeURIComponent(examKey)}/meta.json`,
  },
  ai: {
    explain: "/ai-tutor/explain",
    hint: "/ai-tutor/hint",
    similar: "/ai-tutor/similar",
  },
  analytics: {
    topicProgress: "/analytics/topic-progress",
    weakArea: "/progress/weak-area",
  },
  admin: {
    users: "/admin/users",
    userById: (userId: string) => `/admin/users/${userId}`,
    toggleActive: (userId: string) => `/admin/users/${userId}/toggle-active`,
    resendVerification: (userId: string) =>
      `/admin/users/${userId}/resend-verification`,
    deleteUser: (userId: string) => `/admin/users/${userId}`,
    plans: "/admin/subscription-plans",
    planById: (id: number) => `/admin/subscription-plans/${id}`,
    subjects: "/admin/subjects",
    subjectById: (id: number) => `/admin/subjects/${id}`,
    faqCategories: "/admin/faq-categories",
    faqCategoryById: (id: string) => `/admin/faq-categories/${id}`,
    faqs: "/admin/faqs",
    faqById: (id: number) => `/admin/faqs/${id}`,
    testimonials: "/admin/testimonials",
    testimonialById: (id: number) => `/admin/testimonials/${id}`,
    billing: {
      overview: "/admin/billing/overview",
      subscriptions: "/admin/billing/subscriptions",
      paymentEvents: "/admin/billing/payment-events",
    },
  },
  public: {
    testimonials: "/testimonials",
    faqCategories: "/faq-categories",
    faqs: "/faqs",
  },
  subjects: {
    list: "/subjects",
    byId: (id: number) => `/subjects/${id}`,
  },
  topics: {
    catalogue: "/topic",
  },
  knowledge: {
    ask: "/knowledge/ask",
  },
  notifications: {
    me: (userId: number) => `/notifications/me/${userId}`,
    unreadCount: (userId: number) =>
      `/notifications/me/${userId}/unread-count`,
    preferences: (userId: number) =>
      `/notifications/preferences/${userId}`,
    markRead: (notificationId: number, userId: number) =>
      `/notifications/${notificationId}/read/${userId}`,
    markAllRead: (userId: number) =>
      `/notifications/mark-all-read/${userId}`,
  },
  contributor: {
    dashboard: "/contributor/dashboard",
    tasks: "/contributor/tasks/me",
    rubricsMine: "/contributor/rubrics/mine",
    rubricByQuestionId: (questionId: number) =>
      `/contributor/rubrics/question/${questionId}`,
    rubrics: "/contributor/rubrics",
    rubricById: (id: number) => `/contributor/rubrics/${id}`,
    datasetQa: "/contributor/dataset-qa",
    datasetQaById: (id: number) => `/contributor/dataset-qa/${id}`,
    testAnswer: (id: number) => `/contributor/dataset-qa/${id}/test-answer`,
  },
} as const;
