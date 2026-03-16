import { redirect } from 'next/navigation';

export default function PracticeMathMethodsTopicRedirectPage({
    searchParams,
}: {
    searchParams?: { topicCode?: string };
}) {
    const topicCode = searchParams?.topicCode
        ? `?topicCode=${encodeURIComponent(searchParams.topicCode)}`
        : '';

    redirect(`/student/practice/math-methods/topic${topicCode}`);
}