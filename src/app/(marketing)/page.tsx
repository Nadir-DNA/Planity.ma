import { HeroSection } from "@/components/marketing/hero-section";
import { CategoryGrid } from "@/components/marketing/category-grid";
import { FeaturedSalons } from "@/components/marketing/featured-salons";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { StatsSection } from "@/components/marketing/stats-section";
import { CitiesSection } from "@/components/marketing/cities-section";
import { ProCTA } from "@/components/marketing/pro-cta";

// Salons en vedette lus en DB → re-générer la page régulièrement
export const revalidate = 300;

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoryGrid />
      <FeaturedSalons />
      <HowItWorks />
      <StatsSection />
      <CitiesSection />
      <ProCTA />
    </>
  );
}