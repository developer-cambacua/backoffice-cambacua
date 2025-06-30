export type TButton = {
  type?: "button" | "submit" | "reset";
  color:
    | "primary"
    | "secondary"
    | "tertiary"
    | "ghost"
    | "outline"
    | "error"
    | "unstyled";
  fontSize?: "sm" | "md" | "lg" | "xxl";
  width?: "auto" | "full" | "responsive";
  labelAlign?: "left" | "center" | "right";
};

export type TButtonLink = {
  role?: string;
  color: "primary" | "secondary" | "tertiary" | "error" | "link";
  fontSize?: "sm" | "md" | "lg" | "xl" | "xxl";
  width?: "auto" | "full" | "responsive";
};
