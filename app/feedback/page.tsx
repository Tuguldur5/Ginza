import { redirect } from "next/navigation";

export default async function LegacyFeedback({ searchParams }: { searchParams: Promise<{ table?: string }> }) {
    redirect(`/feedback/room/${Number((await searchParams).table) || 1}`);
}
