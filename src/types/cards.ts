export type TCardArea = {
    title: string;
    image: () => JSX.Element;
    link: string;
    disabled?: boolean;
}