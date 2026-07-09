interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export default function Spinner({ size = "md", text }: SpinnerProps) {
  return (
    <div className={`spinner spinner-${size}`}>
      <div className="spinner-anim" />
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
}
