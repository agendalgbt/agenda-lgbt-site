import Header from "./components/Header";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Screenshots from "./components/Screenshots";
import Countries from "./components/Countries";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Features />
      <Screenshots />
      <Countries />
      <Footer />
    </main>
  );
}
