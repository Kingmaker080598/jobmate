import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const FuturisticLayout = ({ children }) => {
  const [particles, setParticles] = useState([]);
  const [matrixChars, setMatrixChars] = useState([]);

  useEffect(() => {
    // Generate particles
    const particleArray = [];
    for (let i = 0; i < 50; i++) {
      particleArray.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 4
      });
    }
    setParticles(particleArray);

    // Generate matrix characters
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const matrixArray = [];
    for (let i = 0; i < 30; i++) {
      matrixArray.push({
        id: i,
        char: chars[Math.floor(Math.random() * chars.length)],
        x: Math.random() * 100,
        delay: Math.random() * 3
      });
    }
    setMatrixChars(matrixArray);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Matrix Background */}
      <div className="matrix-bg">
        {matrixChars.map((char) => (
          <div
            key={char.id}
            className="matrix-char"
            style={{
              left: `${char.x}%`,
              animationDelay: `${char.delay}s`
            }}
          >
            {char.char}
          </div>
        ))}
      </div>

      {/* Cyber Grid */}
      <div className="cyber-grid fixed inset-0 opacity-20" />

      {/* Floating Particles */}
      <div className="fixed inset-0 pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle floating-element"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`
            }}
          />
        ))}
      </div>

      {/* Scanning Line Effect */}
      <motion.div
        className="fixed top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60"
        animate={{
          y: [0, window.innerHeight || 800]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Main Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Ambient Glow Effects */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full opacity-10 blur-3xl animate-pulse" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="fixed top-3/4 left-1/2 w-96 h-96 bg-pink-500 rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
    </div>
  );
};

export default FuturisticLayout;