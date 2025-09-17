import HeroSection from '@/components/home/HeroSection';
import FeaturedProperties from '@/components/home/FeaturedProperties';
import RentalFeaturedProperties from '@/components/home/RentalFeaturedProperties';
import BlogPreview from '@/components/home/BlogPreview';

export default async function Home() {
  return (
    <>
      <HeroSection />
      <FeaturedProperties />
      <RentalFeaturedProperties />
      <BlogPreview />
    </>
  );
}