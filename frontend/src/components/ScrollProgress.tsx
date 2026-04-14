import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const ScrollProgress: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  
  return <motion.div className="scroll-progress" style={{ scaleX }} />;
};

export default ScrollProgress;