import api from './axios';
import type { ProductCart, ProductCartItem } from '../types/api';

let _cartId: number | null = null;

export const cartService = {
    create: async (userId: number) => {
        const response = await api.post<ProductCart>('/product-carts', { userId });
        return response.data;
    },
    getItems: async (cartId: number) => {
        console.log('cartService.getItems called with cartId:', cartId);
        const response = await api.get<ProductCartItem[]>(`/product-cart-items?cartId=${cartId}`);
        console.log('cartService.getItems response:', response.data);
        return response.data;
    },
    addItem: async (cartId: number, productCode: string, quantity: number) => {
        const response = await api.post<ProductCartItem>('/product-cart-items', { cartId, productCode, quantity });
        return response.data;
    },
    updateItem: async (id: number, quantity: number, unitPrice: number) => {
        const response = await api.put<ProductCartItem>(`/product-cart-items/${id}`, { quantity, unitPrice });
        return response.data;
    },

    removeItem: async (id: number) => {
        const response = await api.delete(`/product-cart-items/${id}`);
        return response.data;
    },
    ensureCart: async (userId = 1): Promise<number> => {
        if (_cartId !== null) return _cartId;
        const carts = await api.get<ProductCart[]>(`/product-carts?userId=${userId}`).then(r => r.data);
        const existing = carts.find(c => c.status === 'Active');

        if (existing) {
            _cartId = existing.id;
        } else {
            const newCart = await api.post<ProductCart>('/product-carts', { userId }).then(r => r.data);
            _cartId = newCart.id;
        }
        return _cartId!;
    },
    clearCartId: () => { _cartId = null; },
    getCartId: () => {
        return _cartId;
    },
    closeCart: async (cartId: number) => {
        await api.put(`/product-carts/${cartId}`, { status: 'Completed' });
        _cartId = null;
    },
};
