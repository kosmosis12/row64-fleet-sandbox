export default function Icon({ src, size = 20, alt = "", fallback = null }) {
  if (!src && fallback) return <span style={{ fontSize: size * 0.85 }}>{fallback}</span>;
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      style={{ objectFit: "contain", flexShrink: 0 }}
      onError={(e) => {
        e.currentTarget.style.display = "none";
        if (fallback && e.currentTarget.parentElement) {
          const span = document.createElement("span");
          span.textContent = fallback;
          span.style.fontSize = `${size * 0.85}px`;
          e.currentTarget.parentElement.insertBefore(span, e.currentTarget);
        }
      }}
    />
  );
}
