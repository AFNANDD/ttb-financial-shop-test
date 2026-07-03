import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { productService } from '../api/productService';
import { cartService } from '../api/cartService';
import type { Product, ProductCartItem } from '../types/api';
import type { TabScreenProps } from '../types/navigation';

type Props = TabScreenProps<'Shop'>;

export default function ShopScreen({ }: Props) {
    const [products, setProducts] = useState<Product[]>([]);
    const [cartItems, setCartItems] = useState<ProductCartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [addingCode, setAddingCode] = useState<string | null>(null);

    useFocusEffect(
        useCallback(() => {
            fetchAll();
        }, []),
    );

    const fetchAll = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) { setRefreshing(true); }
            else { setLoading(true); }
            setError(null);
            const [data, cartId] = await Promise.all([
                productService.getAll(),
                cartService.ensureCart(),
            ]);
            const [, ci] = await Promise.all([
                Promise.resolve(data),
                cartService.getItems(cartId),
            ]);
            setProducts(data);
            setCartItems(ci);
        } catch {
            setError('Failed to load products. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const handleAddToCart = useCallback(async (item: Product) => {
        setAddingCode(item.code);
        try {
            const cartId = await cartService.ensureCart();
            const currentCart = await cartService.getItems(cartId);
            const existing = currentCart.find(ci => ci.productCode === item.code);
            if (existing) {
                await cartService.updateItem(existing.id, existing.quantity + 1, existing.unitPrice);
                setCartItems(prev => prev.map(ci =>
                    ci.productCode === item.code ? { ...ci, quantity: ci.quantity + 1 } : ci,
                ));
            } else {
                await cartService.addItem(cartId, item.code, 1);
                setCartItems(await cartService.getItems(cartId));
            }
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? 'ไม่สามารถเพิ่มสินค้าได้';
            console.log(`Failed to add product ${item.code} to cart:`, msg);
            Alert.alert('Stock ไม่พอ', msg);
        } finally {
            setAddingCode(null);
        }
    }, []);

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="bg-white px-5 pt-4 pb-4 shadow-sm">
                <Text className="text-2xl font-bold text-gray-900">Shop 🛗</Text>
                <Text className="text-sm text-gray-400 mt-1">
                    {loading ? 'Loading...' : `${products.length} products`}
                </Text>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#6366f1" />
                </View>
            ) : error ? (
                <View className="flex-1 items-center justify-center px-8">
                    <Text className="text-4xl mb-3">🚨</Text>
                    <Text className="text-gray-700 font-semibold text-center">{error}</Text>
                    <TouchableOpacity
                        onPress={() => fetchAll()}
                        className="mt-4 bg-indigo-500 px-6 py-3 rounded-xl"
                    >
                        <Text className="text-white font-semibold">Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={products}
                    keyExtractor={item => String(item.id)}
                    contentContainerStyle={{ padding: 16 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => fetchAll(true)}
                            colors={['#6366f1']}
                        />
                    }
                    ListEmptyComponent={
                        <View className="items-center mt-24">
                            <Text className="text-5xl">📦</Text>
                            <Text className="text-gray-500 mt-3 font-medium">No products yet</Text>
                        </View>
                    }
                    renderItem={({ item }) => {
                        const qty = item.stock?.quantity;
                        const hasStock = qty !== undefined && qty !== null;
                        const stockLabel = !hasStock
                            ? null
                            : qty === 0
                            ? { text: 'Out of stock', cls: 'bg-red-100', txtCls: 'text-red-600' }
                            : qty <= 10
                            ? { text: `Low: ${qty}`, cls: 'bg-yellow-100', txtCls: 'text-yellow-700' }
                            : { text: `${qty} in stock`, cls: 'bg-green-100', txtCls: 'text-green-700' };

                        const isAdding = addingCode === item.code;
                        const outOfStock = qty === 0;
                        const cartQty = cartItems.find(ci => ci.productCode === item.code)?.quantity ?? 0;
                        const cartFull = hasStock && cartQty >= (qty ?? 0) && qty! > 0;
                        const disableAdd = isAdding || outOfStock || cartFull;

                        return (
                            <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
                                <View className="flex-row justify-between items-start">
                                    <View className="flex-1 mr-3">
                                        <Text className="text-gray-900 font-bold text-base">{item.name}</Text>
                                        <Text className="text-gray-400 text-xs mt-0.5">Code: {item.code}</Text>
                                    </View>
                                    <Text className="text-indigo-600 font-bold text-base">
                                        ${Number(item.price).toFixed(2)}
                                    </Text>
                                </View>
                                <View className="flex-row justify-between items-center mt-2">
                                    <Text className="text-gray-300 text-xs">
                                        Added {new Date(item.createdAt).toLocaleDateString()}
                                    </Text>
                                    {stockLabel && (
                                        <View className={`${stockLabel.cls} px-2 py-0.5 rounded-full`}>
                                            <Text className={`${stockLabel.txtCls} text-xs font-semibold`}>
                                                {stockLabel.text}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                                <TouchableOpacity
                                    onPress={() => handleAddToCart(item)}
                                    disabled={disableAdd}
                                    className={`mt-3 rounded-xl py-2.5 items-center ${
                                        outOfStock || cartFull ? 'bg-gray-100' : 'bg-indigo-500'
                                    }`}
                                >
                                    {isAdding ? (
                                        <ActivityIndicator size="small" color="#6366f1" />
                                    ) : (
                                        <Text className={`font-semibold text-sm ${
                                            outOfStock || cartFull ? 'text-gray-400' : 'text-white'
                                        }`}>
                                            {outOfStock
                                                ? 'Out of Stock'
                                                : cartFull
                                                ? `In Cart (${cartQty}/${qty}) ✓`
                                                : cartQty > 0
                                                ? `Add More (${cartQty} in cart) 🛒`
                                                : 'Add to Cart 🛒'}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        );
                    }}
                />
            )}
        </SafeAreaView>
    );
}