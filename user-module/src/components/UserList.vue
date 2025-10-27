<template>
  <div class="user-list">
    <h2>👤 User Management</h2>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Avatar</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td><div class="avatar">{{ user.avatar }}</div></td>
            <td><strong>{{ user.name }}</strong></td>
            <td>{{ user.email }}</td>
            <td><span class="role-badge" :class="user.role.toLowerCase()">{{ user.role }}</span></td>
            <td><span class="status-badge" :class="user.status.toLowerCase()">{{ user.status }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const users = ref([
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    status: 'Active',
    avatar: '👨‍💼'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'User',
    status: 'Active',
    avatar: '👩‍💻'
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'Manager',
    status: 'Active',
    avatar: '👨‍🔧'
  },
  {
    id: 4,
    name: 'Alice Williams',
    email: 'alice@example.com',
    role: 'User',
    status: 'Inactive',
    avatar: '👩‍🎨'
  }
]);
</script>

<style scoped>
.user-list {
  max-width: 1200px;
  margin: 0 auto;
}

h2 {
  color: #1f2937;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  text-align: left;
  padding: 1rem;
  background: #f9fafb;
  color: #374151;
  font-weight: 600;
  border-bottom: 2px solid #e5e7eb;
}

td {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  color: #6b7280;
}

tbody tr:hover {
  background: #f9fafb;
}

.avatar {
  font-size: 2rem;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 50%;
}

.role-badge, .status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 500;
}

.role-badge.admin {
  background: #fef3c7;
  color: #92400e;
}

.role-badge.manager {
  background: #dbeafe;
  color: #1e40af;
}

.role-badge.user {
  background: #e5e7eb;
  color: #374151;
}

.status-badge.active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #991b1b;
}
</style>