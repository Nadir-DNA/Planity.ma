import { HeroSection } from "@/components/marketing/hero-section";
import { CategoryGrid } from "@/components/marketing/category-grid";
import { FeaturedSalons } from "@/components/marketing/featured-salons";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { ProCTA } from "@/components/marketing/pro-cta";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoryGrid />
      <HowItWorks />
      <FeaturedSalons />
      <ProCTA />
    </>
  );
}
