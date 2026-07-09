import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateProduct } from "../../hooks/useApi";

const CATEGORIES = ["Laptops", "Tablets", "Mobile", "Smart Watches"];

export default function AdminAddProduct() {
  const navigate = useNavigate();
  const createMutation = useCreateProduct();
  const [form, setForm] = useState({ name: "", description: "", price: "", category: "Laptops", stock: "1" });
  const [files, setFiles] = useState<FileList | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("description", form.description);
    fd.append("price", form.price);
    fd.append("category", form.category);
    fd.append("stock", form.stock);
    if (files) {
      Array.from(files).forEach((f) => fd.append("images", f));
    }
    createMutation.mutate(fd, {
      onSuccess: () => navigate("/admin/products"),
    });
  };

  return (
    <div>
      <h2>Add Product</h2>
      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={4} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Price ($)</label>
            <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Stock</label>
            <input type="number" min="0" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Images</label>
          <input type="file" multiple accept="image/*" onChange={(e) => setFiles(e.target.files)} />
        </div>
        {createMutation.isError && (
          <p className="form-error">{createMutation.error instanceof Error ? createMutation.error.message : "Failed to create product."}</p>
        )}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating..." : "Create Product"}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate("/admin/products")}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
