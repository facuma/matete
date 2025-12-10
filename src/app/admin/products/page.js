'use client';

import React, { useState, useEffect } from 'react';
import { PlusCircle, Search, Edit, Trash2, AlertTriangle, Package, Upload } from 'lucide-react';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import { getProductImage } from '@/lib/utils';
import ProductFormModal from '@/components/admin/ProductFormModal';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import BulkUploadModal from '@/components/admin/BulkUploadModal';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');

  // Modal states
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, categoryFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      setProducts(data);
      checkStockAlerts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const checkStockAlerts = (productsList) => {
    const outOfStock = productsList.filter(p => (p.stock - (p.reservedStock || 0)) <= 0);
    const lowStock = productsList.filter(p => {
      const available = p.stock - (p.reservedStock || 0);
      return available > 0 && available <= (p.lowStockThreshold || 5);
    });

    if (outOfStock.length > 0) {
      toast.error(
        <div className="flex flex-col gap-1">
          <span className="font-bold">⚠️ {outOfStock.length} Productos Sin Stock</span>
          <span className="text-xs">
            {outOfStock.slice(0, 3).map(p => p.name).join(', ')}
            {outOfStock.length > 3 && ` y ${outOfStock.length - 3} más`}
          </span>
        </div>,
        { duration: 6000 }
      );
    }

    if (lowStock.length > 0) {
      toast.warning(
        <div className="flex flex-col gap-1">
          <span className="font-bold">⚠️ {lowStock.length} Productos con Poco Stock</span>
          <span className="text-xs">
            {lowStock.slice(0, 3).map(p => p.name).join(', ')}
            {lowStock.length > 3 && ` y ${lowStock.length - 3} más`}
          </span>
        </div>,
        { duration: 6000 }
      );
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (categoryFilter !== 'Todos') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const handleSaveProduct = async (productData) => {
    try {
      const method = selectedProduct ? 'PUT' : 'POST';
      const url = '/api/admin/products';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });

      if (res.ok) {
        await fetchProducts();
        setIsFormOpen(false);
        setSelectedProduct(null);
      }
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDeleteProduct = async () => {
    try {
      const res = await fetch(`/api/admin/products?id=${productToDelete.id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        await fetchProducts();
        setIsDeleteOpen(false);
        setProductToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setIsDeleteOpen(true);
  };

  const openCreateModal = () => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-800 mx-auto mb-4"></div>
          <p className="text-stone-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-stone-800">Gestión de Productos</h1>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setIsUploadOpen(true)}
          >
            <Upload size={20} />
            Carga Masiva
          </Button>
          <Button
            variant="primary"
            className="flex items-center gap-2"
            onClick={openCreateModal}
          >
            <PlusCircle size={20} />
            Agregar Producto
          </Button>
        </div>
      </div>

      {/* Stock Alerts Summary */}
      {/* Stock alerts are now shown as Toasts via checkStockAlerts function */}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" size={20} />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-200 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 outline-none"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-stone-200 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 outline-none"
          >
            <option value="Todos">Todas las categorías</option>
            <option value="Mates">Mates</option>
            <option value="Bombillas">Bombillas</option>
            <option value="Yerbas">Yerbas</option>
            <option value="Accesorios">Accesorios</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="p-4 font-semibold text-sm">ID</th>
              <th className="p-4 font-semibold text-sm">Imagen</th>
              <th className="p-4 font-semibold text-sm">Producto</th>
              <th className="p-4 font-semibold text-sm">Categoría</th>
              <th className="p-4 font-semibold text-sm">Precio</th>
              <th className="p-4 font-semibold text-sm">Stock</th>
              <th className="p-4 font-semibold text-sm">Destacado</th>
              <th className="p-4 font-semibold text-sm">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-8 text-center text-stone-400">
                  No se encontraron productos
                </td>
              </tr>
            ) : (
              filteredProducts.map(product => (
                <tr key={product.id} className="border-b border-stone-200 last:border-0 hover:bg-stone-50 transition-colors">
                  <td className="p-4 text-stone-500">{product.id}</td>
                  <td className="p-4">
                    <div className="w-12 h-12 rounded-md overflow-hidden bg-stone-100">
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="p-4 font-medium text-stone-800">{product.name}</td>
                  <td className="p-4 text-stone-600">{product.category}</td>
                  <td className="p-4 text-stone-600">${product.price.toLocaleString('es-AR')}</td>
                  <td className="p-4">
                    {(() => {
                      const availableStock = product.stock - (product.reservedStock || 0);
                      const isLowStock = availableStock <= product.lowStockThreshold;
                      const isOutOfStock = availableStock <= 0;

                      return (
                        <div className="flex items-center gap-2">
                          {isOutOfStock ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 flex items-center gap-1">
                              <AlertTriangle size={12} />
                              Sin Stock
                            </span>
                          ) : isLowStock ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                              <AlertTriangle size={12} />
                              {availableStock} unid.
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex items-center gap-1">
                              <Package size={12} />
                              {availableStock} unid.
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </td>
                  <td className="p-4">
                    {product.featured ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Sí</span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">No</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(product)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(product)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onSave={handleSaveProduct}
        allProducts={products}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={handleDeleteProduct}
        itemName={productToDelete?.name}
        itemType="producto"
      />

      <BulkUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={() => {
          fetchProducts();
          toast.success('Productos importados correctamente');
        }}
      />
    </div>
  );
}
