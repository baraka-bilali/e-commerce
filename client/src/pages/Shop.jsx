import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import '../styles/shop.css';

export default function Shop() {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products')
      .then((res) => {
        setProducts(res.data);
        setSelected(res.data[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="shop">
      <header className="shop-header">
        <div className="shop-logo">Eulogia.</div>
        <div className="shop-search">
          <input
            type="text"
            placeholder="Rechercher des produits..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="button" className="search-btn">🔍</button>
        </div>
        <div className="shop-actions">
          <button type="button" className="icon-btn">🛍</button>
          <button type="button" className="icon-btn">♡</button>
          <div className="user-profile" onClick={logout} title="Déconnexion">
            <span>{user?.name || 'Utilisateur'}</span>
            <img
              src={user?.picture || `https://i.pravatar.cc/40?u=${user?.email}`}
              alt=""
              className="user-avatar"
            />
          </div>
        </div>
      </header>

      <main className="shop-main">
        <section className="hero-card">
          {selected && (
            <>
              <div className="hero-content">
                <span className="hero-badge">{selected.badge || selected.category}</span>
                <h1>{selected.name}</h1>
                <div className="hero-desc">
                  <strong>Sons cristallins</strong>
                  <p>{selected.description}</p>
                </div>
                <button type="button" className="cta-btn">
                  Voir tous les produits
                  <span className="cta-arrow">↗</span>
                </button>
                <div className="social-icons">
                  <span>𝕏</span>
                  <span>♪</span>
                  <span>◎</span>
                  <span>in</span>
                </div>
              </div>
              <div className="hero-image">
                <img src={selected.image} alt={selected.name} />
              </div>
            </>
          )}
        </section>

        <aside className="sidebar">
          <div className="widget colors-widget">
            <h3>Couleurs populaires</h3>
            <div className="color-dots">
              {(selected?.colors || ['#3B5BDB', '#FF6B35', '#51CF66', '#FF4757', '#74C0FC']).map((c) => (
                <span key={c} className="color-dot" style={{ background: c }} />
              ))}
            </div>
          </div>

          {products[1] && (
            <div className="widget product-mini" onClick={() => setSelected(products[1])}>
              <img src={products[1].image} alt={products[1].name} />
              <div className="product-mini-info">
                <span className="mini-arrow">↗</span>
                <h4>{products[1].name}</h4>
                <p>{products[1].price.toFixed(2).replace('.', ',')} €</p>
              </div>
            </div>
          )}

          {products[2] && (
            <div className="widget featured-vertical" onClick={() => setSelected(products[2])}>
              <img src={products[2].image} alt={products[2].name} />
              <div className="featured-overlay">
                <h4>{products[2].name}</h4>
                <p>{products[2].description}</p>
              </div>
            </div>
          )}
        </aside>
      </main>

      <section className="bottom-row">
        <div className="bottom-card">
          <div className="thumb-grid">
            {products.slice(0, 3).map((p) => (
              <img key={p.id} src={p.image} alt={p.name} onClick={() => setSelected(p)} />
            ))}
          </div>
          <p><strong>{products.length * 77}+</strong> articles</p>
        </div>

        <div className="bottom-card stats-card">
          <div className="stats-avatars">
            {[1, 2, 3].map((i) => (
              <img key={i} src={`https://i.pravatar.cc/32?img=${i}`} alt="" />
            ))}
          </div>
          <div>
            <strong>5 M+</strong> téléchargements
          </div>
          <div className="rating-badge">★ 4,6 avis</div>
        </div>

        <div className="bottom-card release-card" onClick={() => setSelected(products[3])}>
          {products[3] && (
            <>
              <img src={products[3].image} alt={products[3].name} />
              <div className="release-info">
                <h4>{products[3].name}</h4>
                <span className="rating-pill">★ {products[3].rating}</span>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="products-grid">
        <h2>Tous les produits</h2>
        <div className="grid">
          {filtered.map((product) => (
            <article
              key={product.id}
              className={`product-card ${selected?.id === product.id ? 'active' : ''}`}
              onClick={() => setSelected(product)}
            >
              <img src={product.image} alt={product.name} />
              <div className="product-card-body">
                <span className="product-category">{product.category}</span>
                <h3>{product.name}</h3>
                <div className="product-footer">
                  <span className="product-price">{product.price.toFixed(2).replace('.', ',')} €</span>
                  <span className="product-rating">★ {product.rating}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
