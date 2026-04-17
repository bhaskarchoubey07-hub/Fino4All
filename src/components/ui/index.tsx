"use client"

import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

interface CardProps {
  children: React.ReactNode
  className?: string
  animate?: boolean
}

export function Card({ children, className, animate = true }: CardProps) {
  const Component = animate ? (motion.div as any) : "div"
  
  return (
    <Component
      initial={animate ? { opacity: 0, y: 20 } : undefined}
      whileInView={animate ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={cn("glass-card p-6 overflow-hidden relative", className)}
    >
      {children}
    </Component>
  )
}

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
}

export function Button({ 
  children, 
  className, 
  variant = "primary", 
  size = "md", 
  ...props 
}: ButtonProps) {
  const buttonVariants = {
    primary: "gradient-bg text-white glow-shadow hover:opacity-90",
    secondary: "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm",
    outline: "border border-white/20 text-white hover:bg-white/5",
    ghost: "text-white/70 hover:text-white hover:bg-white/5"
  }

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5",
    lg: "px-8 py-3.5 text-lg font-semibold"
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
        buttonVariants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  )
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all",
        className
      )}
      {...props}
    />
  )
}
