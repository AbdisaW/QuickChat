import { type InputHTMLAttributes }  from "react";
import styles from './Input.module.css';

type InputFieldProps = {
  label: string;
  id: string;
} & InputHTMLAttributes<HTMLInputElement>; 
function InputField({ label, id, className, ...inputProps }: InputFieldProps) {
  return (
    <div>
      <label htmlFor={id} className={styles['input-label']}>{label}</label>
      <input
        id={id}
        className={`${styles['input-field']} ${className || ""}`}
        {...inputProps}
      />
    </div>
  );
}

export default InputField;
