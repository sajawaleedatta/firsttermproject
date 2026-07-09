import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProduct, useAddToCart } from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";
import ErrorMessage from "../components/ErrorMessage";

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, isLoading, isError, error, refetch } = useProduct(id!);
  const addMutation = useAddToCart();
  const [selectedImage, setSelectedImage] = useState(0);

  const handleAddToCart = () => {
    if (!user) { navigate("/login"); return; }
    addMutation.mutate(
      { productId: id!, quantity: 1 },
      { onSuccess: () => navigate("/cart") }
    );
  };

  if (isLoading) return <Spinner size="lg" text="Loading product..." />;
  if (isError) return <ErrorMessage message={error instanceof Error ? error.message : "Failed to load product"} onRetry={refetch} />;

  const product = data?.data;
  if (!product) return <div className="empty">Product not found.</div>;

  return (
    <div className="product-details">
      <div className="product-details-images">
        <div className="product-details-main-img">
          {product.images[selectedImage] ? <img src={product.images[selectedImage].startsWith("http") ? product.images[selectedImage] : `http://localhost:5000${product.images[selectedImage]}`} alt={product.name} /> : <div className="product-card-placeholder">No Image</div>}
        </div>
        {product.images.length > 1 && (
          <div className="product-details-thumbs">
            {product.images.map((img, i) => (
              <button key={i} className={`thumb-btn ${i === selectedImage ? "active" : ""}`} onClick={() => setSelectedImage(i)}>
                <img src={`http://localhost:5000${img}`} alt="" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="product-details-info">
        <h1>{product.name}</h1>
        {product.category && <span className="product-category">{product.category}</span>}
        <p className="product-price">${product.price.toFixed(2)}</p>
        <p className="product-stock">{product.stock > 0 ? `In Stock (${product.stock} available)` : "Out of Stock"}</p>
        {product.description && <p className="product-description">{product.description}</p>}
        <button className="btn btn-primary" onClick={handleAddToCart} disabled={addMutation.isPending || product.stock < 1}>
          {addMutation.isPending ? "Adding..." : product.stock < 1 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
