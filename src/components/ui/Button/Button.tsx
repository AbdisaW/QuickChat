import type { ReactNode } from "react";
import styles from './Button.module.css';

type ButtonProps = {
    children: ReactNode;                   
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
    className?: string;
};

function Button({ children, onClick, type = "button", className }: ButtonProps) {
    return (
        <button
            type={type}
            className={`${styles.button} ${className || ""}`}
            onClick={onClick}
        >
            {children}  
        </button>
    );
}

export default Button;


