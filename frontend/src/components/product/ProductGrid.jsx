import ProductCard from './ProductCard';

export default function ProductGrid({ products, loading, columns = 4, isMerged = false }) {
  if (loading) {
    return (
      <div className="grid-products">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ borderRadius: 16, overflow: 'hidden', border: isMerged ? 'none' : '1px solid var(--color-border)', background: isMerged ? 'transparent' : 'white' }}>
            <div className="skeleton" style={{ aspectRatio: '1', width: '100%' }} />
            <div style={{ padding: isMerged ? '16px 0 0 0' : '16px' }}>
              <div className="skeleton" style={{ height: 16, borderRadius: 4, marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 14, borderRadius: 4, width: '60%', marginBottom: 12 }} />
              <div className="skeleton" style={{ height: 36, borderRadius: 20 }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const filteredProducts = products ? products.filter(product => product.stock_qty > 0) : [];

  if (filteredProducts.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-medium)' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</div>
        <p style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: 8 }}>No products found</p>
        <p style={{ fontSize: '0.875rem' }}>Try adjusting your filters or search term</p>
      </div>
    );
  }

  return (
    <div className="grid-products">
      {filteredProducts.map(product => (
        <ProductCard key={product.id} product={product} isMerged={isMerged} />
      ))}
    </div>
  );
}
