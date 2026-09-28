import OtpForm from "./OtpForm";

export default async function OtpPage({
  searchParams,
}: {
  searchParams: Promise<{ phone?: string }>;
}) {
  return <OtpForm phone={(await searchParams).phone || ""} />;
}
