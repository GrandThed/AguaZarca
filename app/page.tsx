import PropertySlider from '@/components/home/PropertySlider';
import HeroSection from '@/components/home/HeroSection';
import FeaturedProperties from '@/components/home/FeaturedProperties';
import RentalFeaturedProperties from '@/components/home/RentalFeaturedProperties';
import BlogPreview from '@/components/home/BlogPreview';

export default function Home() {
  return (
    <>
      <PropertySlider />
      <HeroSection />
      <FeaturedProperties />
      <RentalFeaturedProperties />
      <BlogPreview />
    </>
  );
}