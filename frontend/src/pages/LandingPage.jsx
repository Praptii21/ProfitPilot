import LandingNav from '../components/landing/LandingNav.jsx'
import HeroSection from '../components/landing/HeroSection.jsx'
import FeaturesGrid from '../components/landing/FeaturesGrid.jsx'
import HowItWorks from '../components/landing/HowItWorks.jsx'
import CTASection from '../components/landing/CTASection.jsx'
import Footer from '../components/landing/Footer.jsx'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNav />
      <HeroSection />
      <FeaturesGrid />
      <HowItWorks />
      <CTASection />
      <Footer />
    </div>
  )
}
