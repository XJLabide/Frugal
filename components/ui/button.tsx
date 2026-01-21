import * as React from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'link' | 'glow';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', ...props }, ref) => {

        const variants = {
            default: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg active:scale-[0.98]",
            destructive: "bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg active:scale-[0.98]",
            outline: "border-2 border-slate-200 bg-transparent hover:bg-slate-50 hover:border-indigo-300 dark:border-slate-700 dark:hover:bg-slate-800 dark:hover:border-indigo-600",
            ghost: "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50",
            link: "text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400",
            glow: "btn-glow",
        }

        const sizes = {
            default: "h-11 px-5 py-2.5",
            sm: "h-9 rounded-lg px-3 text-sm",
            lg: "h-12 rounded-xl px-8 text-base",
            icon: "h-10 w-10",
        }

        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    variants[variant],
                    sizes[size],
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
