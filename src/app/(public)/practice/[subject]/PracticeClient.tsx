"use client";

import { useState } from "react";
import QuestionCard from "@/components/practice/QuestionCard";
import { MATH_METHODS_TOPICS } from "@/constants/mathMethodsTopics";
import {
  submitAnswer,
  aiExplain,
  aiSimilarQuestion,
  aiHint,
  fetchPracticeQuestions,
  getAdaptiveRecommendation,
} from "@/lib/apiClient";
import { PracticeQuestion } from "@/types/question";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  CheckCircle,
  XCircle,
  Lightbulb,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Loader2,
} from "lucide-react";

type AdaptiveRecommendation = {
  reason: string;
  questions: PracticeQuestion[];
};

export default function PracticeClient({
  initialQuestions,
  subject,
}: {
  initialQuestions: PracticeQuestion[];
  subject: string;
}) {
  /* ===================== QUESTION FLOW ===================== */
  const [questions, setQuestions] = useState<PracticeQuestion[]>(initialQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);

  const question = questions[currentIndex] ?? null;

  /* ===================== CORE STATE ===================== */
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<any>(null);
  const [explanation, setExplanation] = useState<any>(null);

  /* ===================== LOADING STATES ===================== */
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [isHinting, setIsHinting] = useState(false);

  /* ===================== HINT STATE ===================== */
  const [hintLevel, setHintLevel] = useState<1 | 2 | 3>(1);
  const [hints, setHints] = useState<string[]>([]);

  /* ===================== ADAPTIVE RECOMMENDATION ===================== */
  const [recommendation, setRecommendation] =
    useState<AdaptiveRecommendation | null>(null);
  const [isRecLoading, setIsRecLoading] = useState(false);

  const resetHints = () => {
    setHintLevel(1);
    setHints([]);
  };

  const resetQuestionState = () => {
    setAnswer("");
    setResult(null);
    setExplanation(null);
    resetHints();
  };

  if (!question) {
    return (
      <Card className="max-w-2xl mx-auto mt-8">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">No questions loaded.</p>
        </CardContent>
      </Card>
    );
  }

  const aiAvailable = Boolean(question.skillCode);

  /* ===================== HANDLERS ===================== */
  const handleSubmit = async () => {
    if (!question || isSubmitting) return;

    try {
      setIsSubmitting(true);

      const res = await submitAnswer(String(question.id), answer);
      setResult(res);
      setExplanation(null);
      resetHints();

      try {
        setIsRecLoading(true);
        const rec = await getAdaptiveRecommendation();
        setRecommendation(rec);
      } catch (e) {
        console.warn("Recommendation unavailable");
      } finally {
        setIsRecLoading(false);
      }
    } catch (err) {
      console.error("Submit failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExplain = async () => {
    if (!aiAvailable || isExplaining) return;

    try {
      setIsExplaining(true);

      const ai = await aiExplain({
        subject: subject,
        skillCode: question.skillCode!,
        question: question.prompt,
        studentAnswer: answer,
        correctAnswer: question.answer,
      });

      setExplanation(ai);
    } catch (err) {
      console.error("AI explain failed:", err);
    } finally {
      setIsExplaining(false);
    }
  };

  const handleHint = async () => {
    if (!aiAvailable || isHinting || hintLevel > 3) return;

    try {
      setIsHinting(true);

      const res = await aiHint({
        subject: subject,
        skillCode: question.skillCode!,
        question: question.prompt,
        studentAnswer: answer,
        level: hintLevel,
      });

      setHints((prev) => [...prev, res.hint]);
      setHintLevel((prev) => (prev < 3 ? ((prev + 1) as 1 | 2 | 3) : prev));
    } catch (err) {
      console.error("AI hint failed:", err);
    } finally {
      setIsHinting(false);
    }
  };

  const handleSimilar = async () => {
    if (!aiAvailable) return;

    try {
      const next = await aiSimilarQuestion({
        subject: subject,
        skillCode: question.skillCode!,
        question: question.prompt,
      });

      setExplanation({
        stepByStep: ["Try this similar question:"],
        finalAdvice: next.question,
      });

      resetQuestionState();
    } catch (err) {
      console.error("AI similar failed:", err);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex >= questions.length - 1) return;

    setCurrentIndex((i) => i + 1);
    resetQuestionState();
  };

  const startPractice = async (topicCode: string) => {
    try {
      const res = await fetchPracticeQuestions(subject, topicCode);

      setQuestions(res);
      setCurrentIndex(0);
      setRecommendation(null);
      resetQuestionState();
    } catch (err) {
      console.error("Failed to start practice:", err);
    }
  };

  const loadRecommendedSet = () => {
    if (!recommendation?.questions?.length) return;

    setQuestions(recommendation.questions);
    setCurrentIndex(0);
    resetQuestionState();
  };

  /* ===================== UI ===================== */

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between">
        <Badge variant="outline">
          Question {currentIndex + 1} of {questions.length}
        </Badge>
        {aiAvailable && (
          <Badge variant="secondary">
            <Sparkles className="mr-1 h-3 w-3" />
            AI Enabled
          </Badge>
        )}
      </div>

      {/* Topic selector */}
      <div className="flex flex-wrap gap-2">
        {MATH_METHODS_TOPICS.map((t) => (
          <Button
            key={t.code}
            variant="outline"
            size="sm"
            onClick={() => startPractice(t.code)}
          >
            {t.name}
          </Button>
        ))}
      </div>

      {/* Question card */}
      <QuestionCard question={question} />

      {/* Answer input */}
      <div className="flex gap-3">
        <Input
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Enter your answer"
          className="flex-1"
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            "Submit Answer"
          )}
        </Button>
      </div>

      {/* Adaptive recommendation panel */}
      {recommendation && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recommended Next</CardTitle>
              <Button size="sm" onClick={loadRecommendedSet}>
                Load Set
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              {recommendation.reason}
            </p>
            <ul className="list-disc ml-6 text-sm space-y-1">
              {recommendation.questions.slice(0, 5).map((q) => (
                <li key={q.id} className="text-muted-foreground">
                  {q.prompt}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Result feedback */}
      {result && (
        <Card className={result.correct ? "border-green-500" : "border-red-500"}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              {result.correct ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-green-500">Correct!</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="text-red-500">Incorrect</span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!result.correct && result.explanation && (
              <p className="text-sm text-muted-foreground">{result.explanation}</p>
            )}
          </CardContent>
          <CardFooter className="flex gap-2 flex-wrap">
            {aiAvailable && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExplain}
                disabled={isExplaining}
              >
                {isExplaining ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Explain with AI
              </Button>
            )}
            {currentIndex < questions.length - 1 && (
              <Button variant="outline" size="sm" onClick={handleNextQuestion}>
                Next Question
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </Card>
      )}

      {/* Hint panel */}
      {!result?.correct && aiAvailable && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Need a Hint?
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleHint}
                disabled={isHinting || hintLevel > 3}
              >
                {isHinting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Get Hint {hintLevel <= 3 ? hintLevel : ""}
              </Button>
            </div>
          </CardHeader>
          {hints.length > 0 && (
            <CardContent>
              <ul className="space-y-2">
                {hints.map((h, i) => (
                  <li
                    key={i}
                    className="text-sm text-muted-foreground flex items-start gap-2"
                  >
                    <Badge variant="outline" className="shrink-0">
                      Hint {i + 1}
                    </Badge>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          )}
        </Card>
      )}

      {/* AI Explanation panel */}
      {explanation && (
        <Card className="border-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              AI Explanation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {explanation.stepByStep?.length > 0 && (
              <ul className="space-y-2">
                {explanation.stepByStep.map((s: string, i: number) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <Badge variant="secondary" className="shrink-0">
                      Step {i + 1}
                    </Badge>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            )}
            {explanation.finalAdvice && (
              <p className="text-sm text-purple-500 font-medium">
                {explanation.finalAdvice}
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" onClick={handleSimilar}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Try Similar Question
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
