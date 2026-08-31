import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, ArrowRight, Zap, Target, PenTool, Wallet, CalendarDays, LineChart } from 'lucide-react';
import FeatureCard from './FeatureCard';
import ParticleBackground from '../ui/ParticleBackground';

const features = [
  { icon: Target, title: 'Audience Targeting', description: 'Agent configures demographics, interests, and geo-targeting based on your brief.', color: '#3B82F6' },
  { icon: PenTool, title: 'Generative Ad Copy', description: 'Creates platform-specific copy (Instagram, TikTok) with tailored tone.', color: '#8B5CF6' },
  { icon: Wallet, title: 'Smart Budget Allocation', description: 'Distributes budget to maximize reach and estimates CPC per platform.', color: '#22C55E' },
  { icon: CalendarDays, title: 'Phased Scheduling', description: 'Sets up a complete timeline from pre-launch teasers to wrap-up.', color: '#F59E0B' },
  { icon: LineChart, title: 'Performance Analysis', description: 'Analyzes campaign metrics and provides actionable optimizations.', color: '#06B6D4' },
  { icon: Zap, title: 'WebMCP Standard', description: 'Built on the emerging open standard for agent-website collaboration.', color: '#E1306C' }
];

const typingTexts = [
  "Launch a skincare campaign targeting women in Morocco...",
  "Allocate 5,000 MAD across Instagram and Facebook...",
  "Generate ad copy for a luxury summer collection...",
  "Analyze performance of last week's TikTok ads..."
];

export default function HeroSection({ onLaunch }) {
  const [textIndex, setTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let timeout;
    const currentText = typingTexts[textIndex];

    if (isTyping) {
      if (displayText.length < currentText.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentText.slice(0, displayText.length + 1));
        }, 50);
      } else {
        timeout = setTimeout(() => setIsTyping(false), 2000);
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 30);
      } else {
        setTextIndex((prev) => (prev + 1) % typingTexts.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isTyping, textIndex]);

  return (
    <div className="landing-page">
      <ParticleBackground />
      
      <div className="landing-content">
        <header className="landing-header">
          <div className="landing-logo">
            <div className="logo-icon"><SparklesIcon /></div>
            <span className="logo-text">AgentCampaign</span>
          </div>
          <div className="landing-badges">
            <span className="tech-badge"><img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" alt="React" /> React 19</span>
            <span className="tech-badge"><Zap size={14} /> WebMCP</span>
          </div>
        </header>

        <main className="hero-main">
          <motion.div 
            className="hero-badge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Built for the WebMCP Challenge 🏆
          </motion.div>
          
          <motion.h1 
            className="hero-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            The Future of <span className="text-gradient">Agentic Marketing</span>
          </motion.h1>
          
          <motion.p 
            className="hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Build marketing campaigns collaboratively with AI agents. 
            Instead of clicking menus, just tell your agent what you want. 
            Watch the dashboard update in real-time.
          </motion.p>

          <motion.div 
            className="hero-search-container"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="search-bar glass">
              <Bot className="search-icon" />
              <span className="search-text">{displayText}<span className="cursor" /></span>
            </div>
            
            <button className="btn btn-primary btn-xl cta-button" onClick={onLaunch}>
              Enter Workspace <ArrowRight />
            </button>
          </motion.div>

          <div className="features-grid">
            {features.map((feature, i) => (
              <FeatureCard key={i} {...feature} delay={0.4 + (i * 0.1)} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

function SparklesIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
    </svg>
  );
}
