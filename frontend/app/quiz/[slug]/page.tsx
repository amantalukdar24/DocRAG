import QuizClient from "./QuizClient";

interface QuizPageProps {
    params: Promise<{ slug: string }>;
}

export default async function QuizPage({ params }: QuizPageProps) {
    const { slug } = await params;

    return <QuizClient slug={slug} />;
}