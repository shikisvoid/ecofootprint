import React from 'react';
import { cn } from '@/lib/utils';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  gradient?: boolean;
  onClick?: () => void;
}

export const AnimatedCard = ({ 
  children, 
  className, 
  hover = true, 
  glow = false, 
  gradient = false,
  onClick 
}: AnimatedCardProps) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl transition-all duration-300 ease-out",
        "bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl",
        "border border-gray-200/50 dark:border-gray-700/50",
        hover && "hover:scale-[1.02] hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30",
        glow && "shadow-lg shadow-green-500/20 dark:shadow-green-400/20",
        gradient && "bg-gradient-to-br from-white/80 to-green-50/80 dark:from-gray-900/80 dark:to-green-900/20",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {/* Animated background gradient */}
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-green-500/5 to-emerald-500/10 dark:from-transparent dark:via-green-400/5 dark:to-emerald-400/10 opacity-0 hover:opacity-100 transition-opacity duration-500" />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'light' | 'medium' | 'heavy';
}

export const GlassCard = ({ children, className, intensity = 'medium' }: GlassCardProps) => {
  const intensityClasses = {
    light: 'bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm',
    medium: 'bg-white/50 dark:bg-gray-900/50 backdrop-blur-md',
    heavy: 'bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl',
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-xl",
        intensityClasses[intensity],
        "transition-all duration-300 hover:shadow-2xl hover:border-white/30 dark:hover:border-gray-600/50",
        className
      )}
    >
      {children}
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'green' | 'blue' | 'purple' | 'orange' | 'red';
  className?: string;
}

export const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  trendValue, 
  color = 'green',
  className 
}: StatCardProps) => {
  const colorClasses = {
    green: 'from-green-500 to-emerald-500',
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-pink-500',
    orange: 'from-orange-500 to-red-500',
    red: 'from-red-500 to-pink-500',
  };

  const trendColors = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400',
  };

  return (
    <AnimatedCard className={cn("p-6", className)} gradient glow>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
          {trend && trendValue && (
            <div className={cn("flex items-center mt-2 text-sm", trendColors[trend])}>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        
        <div className={cn(
          "w-12 h-12 rounded-xl bg-gradient-to-r flex items-center justify-center text-white shadow-lg",
          colorClasses[color]
        )}>
          {icon}
        </div>
      </div>
    </AnimatedCard>
  );
};

interface ProgressCardProps {
  title: string;
  progress: number;
  total: number;
  unit: string;
  color?: 'green' | 'blue' | 'purple' | 'orange';
  className?: string;
}

export const ProgressCard = ({ 
  title, 
  progress, 
  total, 
  unit, 
  color = 'green',
  className 
}: ProgressCardProps) => {
  const percentage = Math.min((progress / total) * 100, 100);
  
  const colorClasses = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  };

  return (
    <AnimatedCard className={cn("p-6", className)}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {progress}/{total} {unit}
          </span>
        </div>
        
        <div className="space-y-2">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-1000 ease-out",
                colorClasses[color]
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">{percentage.toFixed(1)}% complete</span>
            <span className={cn(
              "font-medium",
              percentage >= 100 ? "text-green-600 dark:text-green-400" : "text-gray-600 dark:text-gray-400"
            )}>
              {percentage >= 100 ? "Goal achieved!" : `${(total - progress).toFixed(1)} ${unit} to go`}
            </span>
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
};
