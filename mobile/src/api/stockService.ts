import api from './axios';
import type {
    ProductStock,
    CreateProductStockRequest,
    UpdateProductStockRequest,
} from '../types/api';

export const stockService = {
    getAll: async () => {
        const response = await api.get<ProductStock[]>('/product-stocks');
        return response.data;
    },
    getById: async (id: number) => {
        const response = await api.get<ProductStock>(`/product-stocks/${id}`);
        return response.data;
    },

    create: async (body: CreateProductStockRequest) => {
        const response = await api.post<ProductStock>('/product-stocks', body);
        return response.data;
    },

    update: async (id: number, body: UpdateProductStockRequest) => {
        const response = await api.put<ProductStock>(`/product-stocks/${id}`, body);
        return response.data;
    },

    remove: async (id: number) => {
        const response = await api.delete(`/product-stocks/${id}`);
        return response.data;
    },
};
