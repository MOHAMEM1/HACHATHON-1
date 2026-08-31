import { motion } from 'framer-motion';

export default function FeatureCard({ icon: Icon, title, description, color, delay }) {
  return (
    <motion.div 
      className="feature-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="feature-card-icon" style={{ background: `${color}15`, color: color }}>
        <Icon strokeWidth={2.5} />
      </div>
      <h3 className="feature-card-title">{title}</h3>
      <p className="feature-card-desc">{description}</p>
    </motion.div>
  );
}
