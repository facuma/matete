import HomePageClient from '@/components/HomePageClient';

// Forzar rendering dinámico
export const dynamic = 'force-dynamic';

export default function HomePage() {
  // No awaited fetches here. Instant render.
  return <HomePageClient />;
}
