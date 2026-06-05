export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizes = { sm: 20, md: 32, lg: 48 };
  const s = sizes[size] || 32;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 }}>
      <div
        style={{
          width: s, height: s,
          border: `${size === 'sm' ? 2 : 3}px solid var(--color-border)`,
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }}
      />
      {text && <p style={{ color: 'var(--color-text-medium)', fontSize: '0.875rem' }}>{text}</p>}
    </div>
  );
}
