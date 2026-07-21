import type {
  TopicChipDTO,
  TopicGroupDTO,
  TopicPracticeStartDTO,
} from "@aitutor/shared";

export type { TopicChipDTO, TopicGroupDTO, TopicPracticeStartDTO };

export const emptyMathMethodsTopicPracticeConfig: TopicPracticeStartDTO = {
  subjectCode: "MATH_METHODS",
  subjectSlug: "math-methods",
  subjectName: "VCE Mathematical Methods",
  intro:
    "Build confidence topic by topic with reviewed questions, worked solutions, and progress tracking.",
  startTitle: "Start Topic Practice",
  startDescription:
    "Master Mathematical Methods through curriculum-aligned topic practice before moving into Exam 1 and Exam 2 style revision.",
  startHref: "/student/practice/math-methods/topic",
  groups: [],
};
