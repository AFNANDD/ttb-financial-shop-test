import api from './axios';
import type {
    ProductOrder,
    ProductOrderItem,
    CreateProductOrderRequest,
    CreateProductOrderItemRequest,
    UpdateProductOrderRequest,
} from '../types/api';

export const orderService = {
    getAll: async (userId?: number) => {
        const params = userId ? { userId } : {};
        const response = await api.get<ProductOrder[]>('/product-orders', { params });
        return response.data;
    },
    getById: async (id: number) => {
        const response = await api.get<ProductOrder>(`/product-orders/${id}`);
        return response.data;
    },

    create: async (body: CreateProductOrderRequest) => {
        const response = await api.post<ProductOrder>('/product-orders', body);
        return response.data;
    },

    createItem: async (body: CreateProductOrderItemRequest) => {
        const response = await api.post<ProductOrderItem>('/product-order-items', body);
        return response.data;
    },

    update: async (id: number, body: UpdateProductOrderRequest) => {
        const response = await api.put<ProductOrder>(`/product-orders/${id}`, body);
        return response.data;
    },

    remove: async (id: number) => {
        const response = await api.delete(`/product-orders/${id}`);
        return response.data;
    },
};
