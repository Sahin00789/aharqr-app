import Navbar from "../components/marketing/Navbar";
import Hero from "../components/marketing/Hero";
 import Features from "../components/marketing/Features";
 import DashboardPreview from "../components/marketing/DashboardPreview";
import Workflow from "../components/marketing/Workflow";
import Pricing from "../components/marketing/Pricing";
import Testimonials from "../components/marketing/Testimonials";
 import FAQ from "../components/marketing/FAQ";
 import Footer from "../components/marketing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main>
         <Hero />
        <Features />
        <DashboardPreview />
        <Workflow />
        <Pricing />
        <Testimonials />
        <FAQ /> 
      </main>

       <Footer /> 
    </div>
  );
}