import { useRef } from 'react';
import { motion, useSpring } from 'framer-motion';

const springConfig = { stiffness: 300, damping: 20, mass: 0.5 };

export default function TiltCard({ children, className = '', style = {}, onClick }) {
  const ref = useRef(null);

  const rotateX = useSpring(0, springConfig);
  const rotateY = useSpring(0, springConfig);

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    const tiltX = -(mouseY / (rect.height / 2)) * 8;
    const tiltY = (mouseX / (rect.width / 2)) * 8;

    rotateX.set(tiltX);
    rotateY.set(tiltY);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={className}
      style={{
        ...style,
        perspective: 1000,
        transformStyle: 'preserve-3d',
        rotateX,
        rotateY,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {children}
    </motion.div>
  );
}
