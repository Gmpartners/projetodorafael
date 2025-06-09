import React from 'react';
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, TrendingDownIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Componente para indicar tendências com animações
export const TrendIndicator = ({ 
  value, 
  period = "vs último mês", 
  size = "sm",
  showIcon = true,
  className 
}) => {
  const isPositive = value > 0;
  const isNeutral = value === 0;
  
  const sizeClasses = {
    xs: "text-xs px-2 py-0.5",
    sm: "text-xs px-2 py-1", 
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2"
  };

  return (
    <div className={cn(
      "inline-flex items-center space-x-1.5 rounded-full font-medium transition-all duration-300 hover:scale-105",
      sizeClasses[size],
      isPositive && "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200",
      !isPositive && !isNeutral && "bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200",
      isNeutral && "bg-gradient-to-r from-zinc-50 to-gray-50 text-zinc-600 border border-zinc-200",
      className
    )}>
      {showIcon && !isNeutral && (
        <div className={cn(
          "flex items-center justify-center w-4 h-4 rounded-full transition-transform duration-300",
          isPositive ? "bg-emerald-100" : "bg-red-100"
        )}>
          {isPositive ? (
            <ArrowUpIcon className="w-2.5 h-2.5" />
          ) : (
            <ArrowDownIcon className="w-2.5 h-2.5" />
          )}
        </div>
      )}
      
      <span className="font-semibold">
        {isNeutral ? "0%" : `${isPositive ? "+" : ""}${value}%`}
      </span>
      
      {period && (
        <span className="text-xs opacity-75">{period}</span>
      )}
    </div>
  );
};

// Componente para loading skeleton mais elegante
export const LoadingSkeleton = ({ 
  rows = 3, 
  showAvatar = false, 
  showBadge = false,
  className 
}) => (
  <div className={cn("space-y-4", className)}>
    {Array(rows).fill(0).map((_, i) => (
      <div key={i} className="flex items-center space-x-4 animate-pulse">
        {showAvatar && (
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-zinc-200 to-zinc-300 rounded-full shadow-inner" />
            <div className="absolute inset-0 w-12 h-12 bg-gradient-to-br from-purple-200/30 to-blue-200/30 rounded-full animate-ping" />
          </div>
        )}
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gradient-to-r from-zinc-200 to-zinc-300 rounded-lg w-3/4 shadow-sm" />
            {showBadge && (
              <div className="h-6 w-16 bg-gradient-to-r from-purple-200 to-purple-300 rounded-full shadow-sm" />
            )}
          </div>
          <div className="h-3 bg-gradient-to-r from-zinc-200 to-zinc-300 rounded-lg w-1/2 shadow-sm" />
        </div>
      </div>
    ))}
  </div>
);

// Componente para estados vazios mais envolventes
export const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  action,
  variant = "default",
  className 
}) => {
  const variants = {
    default: "text-zinc-500",
    primary: "text-purple-600",
    success: "text-emerald-600",
    warning: "text-amber-600",
    danger: "text-red-600"
  };

  return (
    <div className={cn("text-center py-12 px-6", className)}>
      <div className="relative mb-8">
        {/* Ícone principal com efeitos */}
        <div className="relative mx-auto w-24 h-24 rounded-2xl bg-gradient-to-br from-zinc-100 via-zinc-50 to-white shadow-xl flex items-center justify-center border border-zinc-200/50">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-100/20 to-blue-100/20" />
          <Icon className={cn("h-12 w-12 relative z-10", variants[variant])} />
        </div>
        
        {/* Efeitos de fundo animados */}
        <div className="absolute inset-0 w-24 h-24 mx-auto">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-200/30 to-blue-200/30 animate-ping opacity-20" />
          <div className="absolute inset-2 rounded-xl bg-gradient-to-br from-purple-100/40 to-blue-100/40 animate-pulse" />
        </div>
        
        {/* Partículas decorativas */}
        <div className="absolute -top-2 -right-2 w-3 h-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full animate-bounce delay-100" />
        <div className="absolute -bottom-1 -left-3 w-2 h-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full animate-bounce delay-300" />
        <div className="absolute top-1/2 -right-4 w-1.5 h-1.5 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full animate-bounce delay-500" />
      </div>
      
      <div className="max-w-md mx-auto space-y-4">
        <h3 className="text-xl font-bold bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 bg-clip-text text-transparent">
          {title}
        </h3>
        
        <p className="text-zinc-600 leading-relaxed">
          {description}
        </p>
        
        {action && (
          <div className="pt-4">
            {action}
          </div>
        )}
      </div>
    </div>
  );
};

// Componente para métricas/estatísticas premium
export const MetricCard = ({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  color = "purple",
  trend,
  loading = false,
  className
}) => {
  const colorThemes = {
    purple: {
      bg: "from-purple-50 via-white to-purple-50/50",
      iconBg: "from-purple-100 to-purple-200",
      iconColor: "text-purple-700",
      accent: "from-purple-600/5 to-transparent"
    },
    blue: {
      bg: "from-blue-50 via-white to-blue-50/50", 
      iconBg: "from-blue-100 to-blue-200",
      iconColor: "text-blue-700",
      accent: "from-blue-600/5 to-transparent"
    },
    emerald: {
      bg: "from-emerald-50 via-white to-emerald-50/50",
      iconBg: "from-emerald-100 to-emerald-200", 
      iconColor: "text-emerald-700",
      accent: "from-emerald-600/5 to-transparent"
    },
    amber: {
      bg: "from-amber-50 via-white to-amber-50/50",
      iconBg: "from-amber-100 to-amber-200",
      iconColor: "text-amber-700", 
      accent: "from-amber-600/5 to-transparent"
    }
  };

  const theme = colorThemes[color] || colorThemes.purple;

  if (loading) {
    return (
      <div className={cn("relative group", className)}>
        <div className="bg-white border border-zinc-200/50 rounded-2xl p-6 shadow-lg">
          <LoadingSkeleton rows={2} />
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "relative group cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02]",
      className
    )}>
      {/* Background com gradientes */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br rounded-2xl transition-opacity duration-500",
        theme.bg,
        "group-hover:shadow-2xl group-hover:shadow-purple-500/10"
      )} />
      
      {/* Overlay com efeito glass */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl",
        theme.accent
      )} />
      
      {/* Conteúdo */}
      <div className="relative bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-lg group-hover:shadow-xl transition-all duration-500">
        <div className="flex items-start justify-between mb-6">
          {/* Ícone */}
          <div className={cn(
            "p-3 rounded-xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
            `bg-gradient-to-br ${theme.iconBg}`
          )}>
            <Icon className={cn("h-6 w-6", theme.iconColor)} />
          </div>
          
          {/* Trend indicator */}
          {change !== undefined && (
            <TrendIndicator value={change} period={changeLabel} size="sm" />
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-zinc-600 uppercase tracking-wide">
            {title}
          </h3>
          
          <div className="text-3xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-700 bg-clip-text text-transparent">
            {value}
          </div>
        </div>
        
        {trend && (
          <div className="mt-4 pt-4 border-t border-zinc-100">
            <div className="flex items-center space-x-2 text-xs text-zinc-500">
              <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-1000 delay-300",
                    `bg-gradient-to-r ${theme.iconBg.replace('to-', 'to-opacity-70 to-')}`
                  )}
                  style={{ width: `${Math.min(trend, 100)}%` }}
                />
              </div>
              <span className="font-medium">{trend}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente para tabelas modernas
export const ModernTable = ({ 
  columns, 
  data, 
  loading = false,
  onRowClick,
  className 
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200/50 shadow-lg overflow-hidden">
        <div className="p-6">
          <LoadingSkeleton rows={5} showBadge />
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-white rounded-2xl border border-zinc-200/50 shadow-lg overflow-hidden",
      className
    )}>
      {/* Header */}
      <div className="bg-gradient-to-r from-zinc-50 via-white to-zinc-50 border-b border-zinc-200/50 px-6 py-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}>
          {columns.map((column, index) => (
            <div key={index} className="text-sm font-semibold text-zinc-700 uppercase tracking-wide">
              {column.header}
            </div>
          ))}
        </div>
      </div>
      
      {/* Body */}
      <div className="divide-y divide-zinc-100">
        {data.map((row, rowIndex) => (
          <div 
            key={rowIndex}
            onClick={() => onRowClick?.(row)}
            className={cn(
              "grid gap-4 px-6 py-4 transition-all duration-200",
              "hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-transparent",
              onRowClick && "cursor-pointer"
            )}
            style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}
          >
            {columns.map((column, colIndex) => (
              <div key={colIndex} className="flex items-center">
                {column.render ? column.render(row[column.key], row) : row[column.key]}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default {
  TrendIndicator,
  LoadingSkeleton, 
  EmptyState,
  MetricCard,
  ModernTable
};