import { motion } from 'framer-motion';

export default function ProgressBar({ currentStep, totalSteps }) {
  const percentage = Math.min(100, Math.max(0, (currentStep / totalSteps) * 100));

  return (
    <div className="demo-progress-container glass">
      <div className="demo-progress-header">
        <span className="demo-progress-title">Agent Configuration Demo</span>
        <span className="demo-progress-count">{currentStep} / {totalSteps}</span>
      </div>
      <div className="demo-progress-track">
        <motion.div 
          className="demo-progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}
