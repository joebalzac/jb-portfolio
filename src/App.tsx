import { ApolloCaseStudy } from './case-study/ApolloCaseStudy';
import { Craft } from './components/Craft';
import { CustomCursor } from './components/CustomCursor';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { Nav } from './components/Nav';
import { Projects } from './components/Projects';
import { ScrollSecret } from './components/ScrollSecret';
import { Work } from './components/Work';
import { Writing } from './components/Writing';
import { useRoute } from './lib/useRoute';

function Home({ onNavigate }: { onNavigate: (to: string) => void }) {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <CustomCursor />
      <Nav />
      <ScrollSecret />
      <div id="page-content" className="relative z-20 bg-bg">
        <Hero />
        <Work onNavigate={onNavigate} />
        <Projects />
        <Craft />
        <Writing />
        <Footer />
      </div>
    </div>
  );
}

function App() {
  const { path, navigate } = useRoute();

  if (path === '/work/apollo') {
    return <ApolloCaseStudy onNavigate={navigate} />;
  }

  return <Home onNavigate={navigate} />;
}

export default App;
