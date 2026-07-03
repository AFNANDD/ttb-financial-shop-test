import api from './axios';
import type {
    Product,
    CreateProductRequest,
    UpdateProductRequest,
} from '../types/api';

export const productService = {
    getAll: async () => {
        const response = await api.get<Product[]>('/products');
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get<Product>(`/products/${id}`);
        return response.data;
    },

    create: async (body: CreateProductRequest) => {
        const response = await api.post<Product>('/products', body);
        return response.data;
    },

    update: async (id: number, body: UpdateProductRequest) => {
        const response = await api.put<Product>(`/products/${id}`, body);
        return response.data;
    },

    remove: async (id: number) => {
        const response = await api.delete(`/products/${id}`);
        return response.data;
    },
};
