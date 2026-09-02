import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "./globals.css";
import "./admin-overrides.css";

export const metadata = {
  title: "Ginza Karaoke — Санал хүсэлт",
  description: "Ginza Karaoke-ийн үйлчлүүлэгчийн санал хүсэлтийн систем"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="mn"><body>{children}</body></html>;
}