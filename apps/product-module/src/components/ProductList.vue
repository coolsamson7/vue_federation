<template>
  <div class="product-list">
    <h2>📦 Product Catalog</h2>
    <div class="product-grid">
      <div v-for="product in products" :key="product.id" class="product-card">
        <div class="product-image">{{ product.emoji }}</div>
        <h3>{{ product.name }}</h3>
        <p class="price">{{ product.price }}</p>
        <p class="description">{{ product.description }}</p>
        <button class="btn-primary">View Details</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const products = ref([
  {
    id: 1,
    name: 'Product Alpha',
    price: '$99.00',
    emoji: '🎯',
    description: 'Premium quality product'
  },
  {
    id: 2,
    name: 'Product Beta',
    price: '$149.00',
    emoji: '🚀',
    description: 'Advanced features included'
  },
  {
    id: 3,
    name: 'Product Gamma',
    price: '$199.00',
    emoji: '⭐',
    description: 'Enterprise solution'
  },
  {
    id: 4,
    name: 'Product Delta',
    price: '$79.00',
    emoji: '💎',
    description: 'Best value option'
  }
]);
</script>

<style scoped>
.product-list {
  max-width: 1200px;
  margin: 0 auto;
}

h2 {
  color: #1f2937;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.product-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  text-align: center;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.product-image {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.product-card h3 {
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
}

.price {
  color: #667eea;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0.5rem 0;
}

.description {
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0.5rem 0 1rem 0;
}

.btn-primary {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
  width: 100%;
}

.btn-primary:hover {
  background: #5568d3;
}
</style>