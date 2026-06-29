import { Link } from "react-router-dom";
import { Terminal, Zap, Share2, Code2, Layers, ShieldCheck, Play, ArrowRight } from "lucide-react";

const LANGUAGES = [
  { name: "Python", icon: "python/python-original.svg" },
  { name: "JavaScript", icon: "javascript/javascript-original.svg" },
  { name: "TypeScript", icon: "typescript/typescript-original.svg" },
  { name: "Go", icon: "go/go-original.svg" },
  { name: "C++", icon: "cplusplus/cplusplus-original.svg" },
  { name: "Java", icon: "java/java-original.svg" },
  { name: "Rust", icon: "rust/rust-original.svg" },
  { name: "Ruby", icon: "ruby/ruby-original.svg" },
  { name: "PHP", icon: "php/php-original.svg" },
  { name: "Swift", icon: "swift/swift-original.svg" },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary overflow-hidden selection:bg-primary/30">
      
      {/* Background Decorative Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] mix-blend-screen opacity-50 animate-pulse"></div>
        <div className="absolute top-[10%] right-1/4 w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[120px] mix-blend-screen opacity-30"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 flex flex-col items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 shadow-[0_0_20px_rgba(79,70,229,0.15)]">
          <Zap className="w-4 h-4 text-amber-400" fill="currentColor" />
          <span>New: Piston Execution Engine v2</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 max-w-4xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 leading-[1.1]">
          The Ultimate Sandbox for <br className="hidden md:block" />
          <span className="bg-gradient-to-r from-primary via-indigo-400 to-cyan-400 text-transparent bg-clip-text">
            Modern Developers.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-text-secondary max-w-2xl mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          Write, compile, and execute code in 40+ languages instantly directly in your browser. No setup required. Built for speed, collaboration, and learning.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
          <Link to="/editor">
            <button className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary hover:bg-primary-hover text-white text-lg font-semibold shadow-[0_0_40px_rgba(79,70,229,0.3)] hover:shadow-[0_0_60px_rgba(79,70,229,0.5)] hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <Terminal className="w-5 h-5" />
              Start Coding Free
            </button>
          </Link>
          <a href="#features" className="group">
            <button className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-bg-tertiary border border-border-primary hover:border-primary/50 text-text-primary text-lg font-semibold transition-all duration-300 hover:bg-bg-tertiary/80 cursor-pointer">
              Explore Features
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </a>
        </div>
      </div>

      {/* Marquee Section */}
      <div className="relative w-full py-10 border-y border-border-primary bg-bg-secondary/30 backdrop-blur-sm overflow-hidden z-10">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-bg-primary to-transparent z-20 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-bg-primary to-transparent z-20 pointer-events-none"></div>
        
        <div className="flex w-[200%] animate-marquee">
          {/* First Set */}
          <div className="flex w-1/2 justify-around items-center">
            {LANGUAGES.map((lang, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 cursor-pointer">
                <img src={`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${lang.icon}`} alt={lang.name} className="w-12 h-12 md:w-14 md:h-14 drop-shadow-lg" />
                <span className="text-xs font-semibold text-text-muted">{lang.name}</span>
              </div>
            ))}
          </div>
          {/* Duplicate Set for infinite scroll */}
          <div className="flex w-1/2 justify-around items-center">
            {LANGUAGES.map((lang, idx) => (
              <div key={`dup-${idx}`} className="flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 cursor-pointer">
                <img src={`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${lang.icon}`} alt={lang.name} className="w-12 h-12 md:w-14 md:h-14 drop-shadow-lg" />
                <span className="text-xs font-semibold text-text-muted">{lang.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-32">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Everything you need to <span className="text-primary">grow your skills</span>
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Experience a robust development environment right in your browser. From quick scripts to full-fledged interview prep.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard 
            icon={<Play className="w-6 h-6 text-primary" />}
            title="Instant Execution"
            description="Run your code with zero latency using our integrated Piston v2 engine."
          />
          <FeatureCard 
            icon={<Code2 className="w-6 h-6 text-indigo-400" />}
            title="10+ Languages"
            description="From Python and JavaScript to Go and Rust, we've got you covered."
          />
          <FeatureCard 
            icon={<Share2 className="w-6 h-6 text-cyan-400" />}
            title="Share Snippets"
            description="Generate public links to your code snippets to share with your team or recruiters instantly."
          />
          <FeatureCard 
            icon={<Layers className="w-6 h-6 text-pink-400" />}
            title="Syntax Highlighting"
            description="Beautiful, accurate syntax highlighting powered by the legendary Monaco Editor."
          />
          <FeatureCard 
            icon={<ShieldCheck className="w-6 h-6 text-emerald-400" />}
            title="Secure Profiles"
            description="Create an account, securely save your snippets to the cloud, and access them anywhere."
          />
          <FeatureCard 
            icon={<Zap className="w-6 h-6 text-amber-400" />}
            title="Optimistic UI"
            description="Zero loading screens. Start typing instantly while the server warms up in the background."
          />
        </div>
      </div>
      
      {/* Footer CTA */}
      <div className="border-t border-border-primary bg-bg-secondary/20">
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to build your next big idea?</h2>
          <Link to="/editor">
            <button className="px-8 py-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold shadow-lg shadow-primary/20 transition-all duration-300 cursor-pointer">
              Open Horizon Editor
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => {
  return (
    <div className="group relative p-8 rounded-3xl bg-bg-tertiary border border-border-primary hover:border-primary/40 transition-all duration-300 overflow-hidden cursor-default">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-bg-secondary flex items-center justify-center border border-border-primary mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-text-primary mb-3">{title}</h3>
        <p className="text-text-secondary leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

export default LandingPage;
