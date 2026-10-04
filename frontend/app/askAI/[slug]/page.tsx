import AskAIClient from "./AskAIClient";

interface AskAIPageProps {
  params: Promise<{ slug: string }>;
}

export default async function AskAIPage({ params }: AskAIPageProps) {
  const { slug } = await params;

  return <AskAIClient slug={slug} />;
}
