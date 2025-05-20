import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

// Hook para animações de contadores
export const useCountUp = (end, duration = 2000, start = 0) => {
  const [count, setCount] = useState(start);
  
  useEffect(() => {
    if (start === end) return;
    
    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / duration;
      
      if (progress < 1) {
        setCount(Math.floor(start + (end - start) * easeOutQuart(progress)));
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };
    
    requestAnimationFrame(animate);
  }, [end, duration, start]);
  
  return count;
};

// Easing function
const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

// Componente para animações de entrada
export const FadeInUp = ({ 
  children, 
  delay = 0, 
  duration = 600,
  distance = 20,
  className 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  
  return (
    <div
      className={cn(
        "transition-all ease-out",
        isVisible 
          ? "opacity-100 translate-y-0" 
          : "opacity-0",
        className
      )}
      style={{
        transform: isVisible ? 'translateY(0)' : `translateY(${distance}px)`,
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
};

// Componente para efeitos de hover avançados
export const HoverLift = ({ 
  children, 
  lift = 8,
  scale = 1.02,
  className,
  ...props 
}) => (
  <div
    className={cn(
      "transition-all duration-300 ease-out cursor-pointer",
      "hover:shadow-xl hover:shadow-purple-500/10",
      className
    )}
    style={{
      '--lift': `${lift}px`,
      '--scale': scale,
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = `translateY(-${lift}px) scale(${scale})`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0) scale(1)';
    }}
    {...props}
  >
    {children}
  </div>
);

// Componente para efeitos de glass morphism
export const GlassCard = ({ 
  children, 
  className,
  variant = "default",
  ...props 
}) => {
  const variants = {
    default: "bg-white/80 backdrop-blur-xl border-white/20",
    dark: "bg-black/20 backdrop-blur-xl border-white/10",
    purple: "bg-purple-500/10 backdrop-blur-xl border-purple-200/30",
    gradient: "bg-gradient-to-br from-white/90 to-purple-50/80 backdrop-blur-xl border-white/30"
  };

  return (
    <div
      className={cn(
        "rounded-2xl border shadow-xl",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Componente para animações de shimmer/skeleton
export const ShimmerEffect = ({ className, ...props }) => (
  <div
    className={cn(
      "animate-pulse bg-gradient-to-r from-zinc-200 via-zinc-300 to-zinc-200 bg-size-200 animate-shimmer",
      className
    )}
    {...props}
  />
);

// Componente para efeitos de partículas
export const FloatingParticles = ({ count = 6, className }) => {
  const particles = Array.from({ length: count }, (_, i) => i);
  
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {particles.map((particle) => (
        <div
          key={particle}
          className="absolute opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
          }}
        >
          <div 
            className={cn(
              "w-2 h-2 rounded-full",
              particle % 3 === 0 && "bg-purple-400 animate-bounce",
              particle % 3 === 1 && "bg-blue-400 animate-pulse", 
              particle % 3 === 2 && "bg-emerald-400 animate-ping"
            )}
          />
        </div>
      ))}
    </div>
  );
};

// Componente para gradientes animados
export const AnimatedGradient = ({ 
  children, 
  colors = ["purple", "blue", "emerald"],
  className 
}) => {
  const colorMap = {
    purple: "from-purple-400 via-purple-600 to-purple-800",
    blue: "from-blue-400 via-blue-600 to-blue-800", 
    emerald: "from-emerald-400 via-emerald-600 to-emerald-800",
    pink: "from-pink-400 via-pink-600 to-pink-800"
  };
  
  const gradientClasses = colors.map(color => colorMap[color]).join(" ");
  
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-r opacity-10 animate-gradient-x",
          gradientClasses
        )}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

// Componente para números animados
export const AnimatedNumber = ({ 
  value, 
  duration = 2000,
  prefix = "",
  suffix = "",
  className 
}) => {
  const count = useCountUp(value, duration);
  
  return (
    <span className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

// Componente para efeitos de pulso
export const PulseEffect = ({ 
  children, 
  color = "purple",
  size = "md",
  className 
}) => {
  const colors = {
    purple: "bg-purple-400",
    blue: "bg-blue-400", 
    emerald: "bg-emerald-400",
    amber: "bg-amber-400",
    red: "bg-red-400"
  };
  
  const sizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  };
  
  return (
    <div className={cn("relative", className)}>
      {children}
      <div className={cn(
        "absolute top-0 right-0 rounded-full animate-ping opacity-75",
        colors[color],
        sizes[size]
      )} />
      <div className={cn(
        "absolute top-0 right-0 rounded-full",
        colors[color],
        sizes[size]
      )} />
    </div>
  );
};