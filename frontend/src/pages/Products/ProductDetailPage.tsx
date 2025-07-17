import React from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '../../components';

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();

  return (
    <Layout>
      <h1>Product Details</h1>
      <p>Product ID: {productId}</p>
      {/* Product details will be implemented in a future task */}
    </Layout>
  );
};

export default ProductDetailPage;