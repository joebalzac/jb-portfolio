import { Craft } from './components/Craft';
import { CustomCursor } from './components/CustomCursor';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { Nav } from './components/Nav';
import { Projects } from './components/Projects';
import { ScrollSecret } from './components/ScrollSecret';
import { Work } from './components/Work';
import { Writing } from './components/Writing';

function App() {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <CustomCursor />
      <Nav />
      <ScrollSecret />
      <div id="page-content" className="relative z-20 bg-bg">
        <Hero />
        <Work />
        <Projects />
        <Craft />
        <Writing />
        <Footer />
      </div>
    </div>
  );
}

export default App;
