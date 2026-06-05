const STATUS_CONFIG = {
  placed: { label: 'Order Placed', icon: '📋', color: '#1565C0', bg: '#E3F2FD' },
  confirmed: { label: 'Confirmed', icon: '✅', color: '#2E7D32', bg: '#E8F5E9' },
  packed: { label: 'Packed', icon: '📦', color: '#F57C00', bg: '#FFF3E0' },
  shipped: { label: 'Shipped', icon: '🚚', color: '#6A1B9A', bg: '#F3E5F5' },
  out_for_delivery: { label: 'Out for Delivery', icon: '🛵', color: '#E65100', bg: '#FBE9E7' },
  delivered: { label: 'Delivered', icon: '🎉', color: '#2E7D32', bg: '#E8F5E9' },
  cancelled: { label: 'Cancelled', icon: '❌', color: '#C62828', bg: '#FFEBEE' },
};

const STEPS = ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];

export default function OrderTracker({ status }) {
  if (status === 'cancelled') {
    return (
      <div style={{
        background: '#FFEBEE', borderRadius: 12, padding: '20px 24px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <span style={{ fontSize: '1.5rem' }}>❌</span>
        <div>
          <p style={{ fontWeight: 700, color: '#C62828', marginBottom: 2 }}>Order Cancelled</p>
          <p style={{ fontSize: '0.875rem', color: '#6B6B7B' }}>This order has been cancelled</p>
        </div>
      </div>
    );
  }

  const currentIndex = STEPS.indexOf(status);

  return (
    <div style={{ position: 'relative', padding: '24px 0' }}>
      {/* Progress line background */}
      <div style={{
        position: 'absolute', top: 46, left: '8%', right: '8%',
        height: 3, background: 'var(--color-border)', borderRadius: 2,
      }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(to right, var(--color-primary), var(--color-primary-light))',
          borderRadius: 2,
          width: currentIndex < 0 ? '0%' : `${(currentIndex / (STEPS.length - 1)) * 100}%`,
          transition: 'width 0.6s ease',
        }} />
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        {STEPS.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isActive = idx === currentIndex;
          const config = STATUS_CONFIG[step];

          return (
            <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem',
                border: `3px solid ${isDone || isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: isDone ? 'var(--color-primary)' : isActive ? 'var(--color-primary)' : 'white',
                transition: 'all 0.3s ease',
                boxShadow: isActive ? '0 0 0 4px rgba(200,73,106,0.15)' : 'none',
              }}>
                {isDone ? '✓' : config.icon}
              </div>
              <span style={{
                fontSize: '0.65rem', fontWeight: 600, textAlign: 'center',
                color: isDone || isActive ? 'var(--color-primary)' : 'var(--color-text-light)',
                maxWidth: 70, lineHeight: 1.3,
              }}>
                {config.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { STATUS_CONFIG };
