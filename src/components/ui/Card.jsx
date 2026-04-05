import { cn } from '../../utils/formatters';
import { motion } from 'framer-motion';

export const Card = ({ children, className, animate = false, delay = 0, ...props }) => {
  const Comp = animate ? motion.div : 'div';
  
  const animationProps = animate ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay }
  } : {};

  return (
    <Comp 
      className={cn("card-base", className)}
      {...animationProps}
      {...props}
    >
      {children}
    </Comp>
  );
};
