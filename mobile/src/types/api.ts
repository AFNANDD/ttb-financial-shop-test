// ─── Product ─────────────────────────────────────────
export interface Product {
    id: number;
    code: string;
    name: string;
    price: number;
    createdAt: string;
    stock: {
        id: number;
        quantity: number;
        updatedAt: string;
    } | null;
}

export interface CreateProductRequest {
    code: string;
    name: string;
    price: number;
}

export interface UpdateProductRequest {
    code: string;
    name: string;
    price: number;
}

// ─── Stock ───────────────────────────────────────────
export interface ProductStock {
    id: number;
    productCode: string;
    quantity: number;
    updatedAt: string;
    productDetail: {
        id: number;
        name: string;
        price: number;
    } | null;
}

export interface CreateProductStockRequest {
    productCode: string;
    quantity: number;
}

export interface UpdateProductStockRequest {
    quantity: number;
}

// ─── Cart ────────────────────────────────────────────
export interface ProductCartItem {
    id: number;
    cartId: number;
    productCode: string;
    quantity: number;
    unitPrice: number;
    productDetail: {
        id: number;
        name: string;
        price: number;
    } | null;
}

export interface ProductCart {
    id: number;
    userId: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    items?: ProductCartItem[];
}

export interface CreateProductCartRequest {
    userId: number;
}

export interface UpdateProductCartRequest {
    status: string;
}

// ─── Order ───────────────────────────────────────────
export interface ProductOrderItem {
    id: number;
    orderId: number;
    productCode: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    productDetail: {
        id: number;
        name: string;
        price: number;
    } | null;
}

export interface ProductOrder {
    id: number;
    userId: number;
    orderNo: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    items?: ProductOrderItem[];
}

export interface CreateProductOrderItemRequest {
  orderId: number;
  productCode: string;
  quantity: number;
}

export interface CreateProductOrderRequest {
    userId: number;
    orderNo: string;
    totalAmount: number;
}

export interface UpdateProductOrderRequest {
    status: string;
    totalAmount: number;
}
