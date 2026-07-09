import { Link, useSearchParams } from "react-router-dom";
import { useProducts } from "../hooks/useApi";
import Spinner from "../components/Spinner";
import ErrorMessage from "../components/ErrorMessage";

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";
  const page = Number(searchParams.get("page")) || 1;

  const { data, isLoading, isError, error, refetch } = useProducts({
    search: search || undefined,
    category: category || undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    sortBy,
    sortOrder,
    page,
    limit: 12,
  });

  const updateParams = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    if (updates.search !== undefined || updates.category !== undefined ||
        updates.minPrice !== undefined || updates.maxPrice !== undefined ||
        updates.sortBy !== undefined || updates.sortOrder !== undefined) {
      next.delete("page");
    }
    setSearchParams(next);
  };

  const categories = ["Laptops", "Tablets", "Mobile", "Smart Watches"];
  const products = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="products-page">
      <div className="products-sidebar">
        <h3>Filters</h3>
        <div className="filter-group">
          <label>Search</label>
          <input type="text" placeholder="Search products..." value={search} onChange={(e) => updateParams({ search: e.target.value })} />
        </div>
        <div className="filter-group">
          <label>Category</label>
          <select value={category} onChange={(e) => updateParams({ category: e.target.value })}>
            <option value="">All</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Min Price</label>
          <input type="number" min="0" placeholder="0" value={minPrice} onChange={(e) => updateParams({ minPrice: e.target.value })} />
        </div>
        <div className="filter-group">
          <label>Max Price</label>
          <input type="number" min="0" placeholder="999" value={maxPrice} onChange={(e) => updateParams({ maxPrice: e.target.value })} />
        </div>
      </div>

      <div className="products-main">
        <div className="products-toolbar">
          <h2>Products {pagination ? `(${pagination.total})` : ""}</h2>
          <select value={`${sortBy}-${sortOrder}`} onChange={(e) => { const [by, order] = e.target.value.split("-"); updateParams({ sortBy: by, sortOrder: order }); }}>
            <option value="createdAt-desc">Newest</option>
            <option value="createdAt-asc">Oldest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A-Z</option>
            <option value="name-desc">Name: Z-A</option>
          </select>
        </div>

        {isLoading ? <Spinner size="lg" text="Loading products..." /> : null}
        {isError ? <ErrorMessage message={error instanceof Error ? error.message : "Failed to load products"} onRetry={refetch} /> : null}

        {!isLoading && !isError && products.length === 0 ? (
          <div className="empty">No products found.</div>
        ) : null}

        {!isLoading && !isError && products.length > 0 ? (
          <>
            <div className="product-grid">
              {products.map((p) => (
                <Link to={`/products/${p.id}`} key={p.id} className="product-card">
                  <div className="product-card-img">
                    {p.images[0] ? <img src={p.images[0].startsWith("http") ? p.images[0] : `http://localhost:5000${p.images[0]}`} alt={p.name} /> : <div className="product-card-placeholder">No Image</div>}
                  </div>
                  <div className="product-card-body">
                    <h4>{p.name}</h4>
                    {p.category && <span className="product-category">{p.category}</span>}
                    <p className="product-price">${p.price.toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
            {pagination && pagination.totalPages > 1 && (
              <div className="pagination">
                <button disabled={page <= 1} onClick={() => updateParams({ page: String(page - 1) })}>Previous</button>
                <span>Page {page} of {pagination.totalPages}</span>
                <button disabled={page >= pagination.totalPages} onClick={() => updateParams({ page: String(page + 1) })}>Next</button>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
