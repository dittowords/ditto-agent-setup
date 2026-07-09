export function Button({ children, variant = "primary", ...props }) {
  return (
    <button className={`ds-button ds-button--${variant}`} {...props}>
      {children}
    </button>
  );
}
