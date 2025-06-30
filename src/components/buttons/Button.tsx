import { cn } from "@/lib/utils";

export type ButtonVariant = "solid" | "ghost" | "outline" | "unstyled";
export type ButtonColor = "primary" | "secondary" | "tertiary" | "error";
export type ButtonFontSize = "sm" | "md" | "lg" | "xl" | "xxl";
export type ButtonWidth = "auto" | "full" | "responsive";
export type ButtonTextAlign = "left" | "center" | "right";

export interface TButton extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  color?: ButtonColor;
  fontSize?: ButtonFontSize;
  width?: ButtonWidth;
  labelAlign?: ButtonTextAlign;
}

export const Button = ({
  children,
  type = "button",
  variant = "solid",
  color = "primary",
  fontSize = "md",
  width = "auto",
  labelAlign = "center",
  className,
  ...props
}: React.PropsWithChildren<TButton>) => {
  const baseClasses =
    "rounded-sm font-medium transition-all px-4 py-2 disabled:cursor-not-allowed duration-200 border-2";

  const variantClasses: Record<ButtonVariant, string> = {
    solid: "",
    ghost: "bg-transparent border-transparent",
    outline: "border enabled:border-gray-300",
    unstyled: "",
  };

  const colorClasses: Record<ButtonColor, Record<ButtonVariant, string>> = {
    primary: {
      solid:
        "bg-primary-500 text-white enabled:hover:bg-primary-600 border-transparent focus:border-primary-500 focus-visible:border-primary-500 disabled:bg-gray-200 disabled:text-gray-300",
      ghost: "enabled:text-primary-500 enabled:hover:bg-primary-500/10 enabled:hover:text-primary-600 disabled:text-gray-400",
      outline:
        "text-primary-500 hover:text-white hover:bg-primary-500 border-primary-500",
      unstyled: "",
    },
    secondary: {
      solid:
        "bg-secondary-900 text-white hover:bg-secondary-500 enabled:border-secondary-900 enabled:hover:border-secondary-500 focus:border-secondary-500 disabled:bg-gray-200 disabled:text-gray-300",
      ghost:
        "text-secondary-900 hover:bg-secondary-900/10 hover:text-secondary-950",
      outline:
        "text-secondary-900 hover:text-white hover:bg-secondary-900 border-secondary-900",
      unstyled: "",
    },
    tertiary: {
      solid:
        "bg-gray-600 text-white hover:bg-gray-700 border border-gray-600 hover:border-gray-700 disabled:bg-gray-200 disabled:text-gray-300",
      ghost: "enabled:text-gray-600 enabled:hover:text-gray-700 enabled:hover:bg-gray-100 disabled:text-gray-400",
      outline:
        "text-gray-600 hover:text-white hover:bg-gray-600 border-gray-600",
      unstyled: "",
    },
    error: {
      solid:
        "bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-300 disabled:text-gray-400 border-red-500 enabled:hover:border-red-600 disabled:border-gray-300",
      ghost: "text-red-500 enabled:hover:bg-red-500/10 enabled:hover:text-red-600 disabled:text-gray-400",
      outline: "text-red-500 hover:text-white hover:bg-red-500 border-red-500",
      unstyled: "",
    },
  };

  const fontsizeClass: Record<ButtonFontSize, string> = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    xxl: "text-2xl",
  };

  const widthClass: Record<ButtonWidth, string> = {
    auto: "w-auto",
    full: "w-full",
    responsive: "w-full md:w-fit",
  };

  const textAlignClass: Record<ButtonTextAlign, string> = {
    left: "text-start",
    center: "text-center",
    right: "text-end",
  };

  return (
    <button
      type={type}
      className={cn(
        "font-openSans",
        baseClasses,
        fontsizeClass[fontSize],
        widthClass[width],
        textAlignClass[labelAlign],
        variant !== "unstyled" && variantClasses[variant],
        variant !== "unstyled" && color && colorClasses[color][variant],
        className
      )}
      {...props}>
      {children}
    </button>
  );
};
