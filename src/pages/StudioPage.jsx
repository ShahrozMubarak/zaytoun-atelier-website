import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from '../components/AdminDashboard';
import AdminGate from '../components/AdminGate';

export default function StudioPage({
  orders = [],
  onUpdateOrderStatus,
  products = [],
  onAddProduct,
  onUpdateProductStock,
  onUpdateProductPrice,
  onDeleteProduct,
  onImportCatalog,
  themeConfig,
  onUpdateTheme,
  onTryOnProduct,
  user = null,
  onOpenAuthModal
}) {
  const navigate = useNavigate();

  const handleCloseAdmin = () => {
    navigate('/shop');
  };

  const handleTryOn = (product) => {
    if (onTryOnProduct) {
      onTryOnProduct(product);
    }
    navigate('/shop');
  };

  return (
    <div className="min-h-screen w-full bg-white dark:bg-onyx-950 text-onyx-950 dark:text-neutral-100 transition-colors">
      <AdminGate user={user} onOpenAuthModal={onOpenAuthModal}>
        <AdminDashboard
          orders={orders}
          onUpdateOrderStatus={onUpdateOrderStatus}
          products={products}
          onAddProduct={onAddProduct}
          onUpdateProductStock={onUpdateProductStock}
          onUpdateProductPrice={onUpdateProductPrice}
          onDeleteProduct={onDeleteProduct}
          onImportCatalog={onImportCatalog}
          themeConfig={themeConfig}
          onUpdateTheme={onUpdateTheme}
          onCloseAdmin={handleCloseAdmin}
          onTryOnProduct={handleTryOn}
          user={user}
        />
      </AdminGate>
    </div>
  );
}
