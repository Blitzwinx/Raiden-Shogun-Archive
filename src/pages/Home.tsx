import { Link } from 'react-router-dom';
import { BookOpen, Sword, Shield, ArrowRight, Sparkles, Bookmark } from 'lucide-react';

const Home = () => {
  const sections = [
    {
      title: 'Lore',
      description: 'Explore the rich history and mythology of the Electro Archon',
      icon: Bookmark,
      path: '/lore',
      gradient: 'from-purple-600 to-indigo-600',
    },
    {
      title: 'In-Game',
      description: 'Character builds, artifacts, weapons, and gameplay guides',
      icon: Sword,
      path: '/ingame',
      gradient: 'from-indigo-600 to-purple-600',
    },
    {
      title: 'Power Scaling',
      description: 'Analysis of abilities, strength, and combat capabilities',
      icon: Shield,
      path: '/powerscaling',
      gradient: 'from-purple-600 to-pink-600',
    },
    {
      title: 'Blog',
      description: 'Latest thoughts and discussions about Raiden Shogun',
      icon: BookOpen,
      path: '/blog',
      gradient: 'from-pink-600 to-purple-600',
    },
  ];

  return (
    <div className="pt-16 min-h-screen">
      {/* Hero Section with Split Layout */}
      <div className="relative overflow-hidden min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text Content */}
            <div className="fade-in">
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-6 w-6 text-purple-300" />
                  <span className="text-purple-300 font-medium">The Almighty Narukami Ogosho</span>
                </div>
              </div>
              
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold gradient-text heading-font mb-6 leading-tight pb-2">
                Raiden
                <br />
                <span className="text-5xl md:text-6xl lg:text-7xl">Shogun</span>
              </h1>
              
              <div className="space-y-4 mb-8">
                <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
                  The <span className="text-purple-300 font-semibold">Electro Archon</span>, wielder of the 
                  <span className="text-purple-300 font-semibold"> Musou Isshin</span>, and eternal guardian of Inazuma.
                </p>
                <p className="text-lg text-gray-400 leading-relaxed">
                  Discover her story, power, and legacy in this comprehensive archive dedicated to 
                  her excellency.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="glass-morphism border border-purple-500/30 rounded-lg p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-purple-300">5000+</div>
                  <div className="text-sm text-gray-400">Age (estimation)</div>
                </div>
                <div className="glass-morphism border border-purple-500/30 rounded-lg p-4 text-center">
                  <div className="text-lg sm:text-2xl font-bold text-purple-300 whitespace-nowrap">Female</div>
                  <div className="text-sm text-gray-400">Sex</div>
                </div>
                <div className="glass-morphism border border-purple-500/30 rounded-lg p-4 text-center">
                  <div className="text-lg sm:text-2xl font-bold text-purple-300 whitespace-nowrap">Archon</div>
                  <div className="text-sm text-gray-400">Role</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/lore"
                  className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-8 py-4 rounded-lg font-semibold transition-all duration-200 hover-lift text-lg"
                >
                  <Bookmark className="h-5 w-5" />
                  <span>Explore Lore</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/ingame"
                  className="inline-flex items-center justify-center space-x-2 glass-morphism border-2 border-purple-500/30 hover:border-purple-400/50 px-8 py-4 rounded-lg font-semibold transition-all duration-200 hover-lift text-lg"
                >
                  <Sword className="h-5 w-5" />
                  <span>View Builds</span>
                </Link>
              </div>
            </div>

            {/* Right Side - Image Placeholder */}
<div className="relative slide-in flex justify-center overflow-visible" style={{ animationDelay: '0.3s' }}>
  <div 
    className="relative group w-full max-w-[1200px] p-12 transition-all duration-300 ease-in-out"
    style={{ overflow: 'visible' }}
  >
    <img 
      src="/splash.png"
      alt="Raiden Shogun - Electro Archon"
      className="w-full h-auto object-contain 
                 transition-transform duration-300 ease-in-out
                 group-hover:scale-110"
      style={{
        filter: "drop-shadow(0 0 50px rgba(168, 85, 247, 0.8))",
        display: "block"
      }}
    />
  </div>
</div>
          </div>
        </div>
      </div>

      {/* Sections Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold gradient-text heading-font mb-4">
            Explore the Archive
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Dive deep into every aspect of the Raiden Shogun's supremacy
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Link
                key={section.title}
                to={section.path}
                className={`group relative overflow-hidden rounded-2xl p-8 glass-morphism border-2 border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover-lift slide-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${section.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
                <div className="relative z-10">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="p-3 bg-purple-600/20 rounded-xl">
                      <Icon className="h-8 w-8 text-purple-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white heading-font">
                      {section.title}
                    </h3>
                  </div>
                  <p className="text-gray-300 text-lg leading-relaxed mb-6">
                    {section.description}
                  </p>
                  <div className="flex items-center space-x-2 text-purple-400 group-hover:text-purple-300 transition-colors">
                    <span className="font-semibold">Explore</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quote Section */}
      <div className="bg-purple-900/30 backdrop-blur-sm border-y border-purple-500/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <blockquote className="text-2xl md:text-3xl font-medium text-gray-200 italic heading-font mb-6">
            "Only through Eternity are you closest to the heavenly principles."
          </blockquote>
          <cite className="text-lg text-purple-300 font-semibold">
            — Raiden Shogun
          </cite>
        </div>
      </div>
    </div>
  );
};

export default Home;