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
import { stockService } from '../api/stockService';
import type { ProductStock } from '../types/api';
import type { TabScreenProps } from '../types/navigation';

type Props = TabScreenProps<'Stock'>;

function StockBadge({ qty }: { qty: number }) {
    if (qty === 0)
        return (
            <View className="bg-red-100 px-2 py-0.5 rounded-full">
                <Text className="text-red-600 text-xs font-semibold">Out of stock</Text>
            </View>
        );
    if (qty <= 10)
        return (
            <View className="bg-yellow-100 px-2 py-0.5 rounded-full">
                <Text className="text-yellow-600 text-xs font-semibold">Low: {qty}</Text>
            </View>
        );
    return (
        <View className="bg-green-100 px-2 py-0.5 rounded-full">
            <Text className="text-green-600 text-xs font-semibold">{qty} in stock</Text>
        </View>
    );
}

export default function StockScreen({ }: Props) {
    const [stocks, setStocks] = useState<ProductStock[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    useFocusEffect(
        useCallback(() => {
            fetchStocks();
        }, []),
    );

    const fetchStocks = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) { setRefreshing(true); }
            else { setLoading(true); }
            setError(null);
            const data = await stockService.getAll();
            setStocks(data);
        } catch {
            setError('Failed to load stock. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const updateQuantity = useCallback(async (item: ProductStock, delta: number) => {
        const newQty = item.quantity + delta;
        if (newQty < 0) {
            Alert.alert('Invalid', 'Quantity cannot be less than 0');
            return;
        }
        setUpdatingId(item.id);
        try {
            const updated = await stockService.update(item.id, { quantity: newQty });
            setStocks(prev =>
                prev.map(s => s.id === item.id ? { ...s, quantity: updated.quantity, updatedAt: updated.updatedAt } : s),
            );
        } catch {
            Alert.alert('Error', 'Failed to update stock');
        } finally {
            setUpdatingId(null);
        }
    }, []);

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="bg-white px-5 pt-4 pb-4 shadow-sm">
                <Text className="text-2xl font-bold text-gray-900">Stock 📦</Text>
                <Text className="text-sm text-gray-400 mt-1">
                    {loading ? 'Loading...' : `${stocks.length} items`}
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
                        onPress={() => fetchStocks()}
                        className="mt-4 bg-indigo-500 px-6 py-3 rounded-xl"
                    >
                        <Text className="text-white font-semibold">Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={stocks}
                    keyExtractor={item => String(item.id)}
                    contentContainerStyle={{ padding: 16 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => fetchStocks(true)}
                            colors={['#6366f1']}
                        />
                    }
                    ListEmptyComponent={
                        <View className="items-center mt-24">
                            <Text className="text-5xl">📦</Text>
                            <Text className="text-gray-500 mt-3 font-medium">No stock records</Text>
                        </View>
                    }
                    renderItem={({ item }) => {
                        const isUpdating = updatingId === item.id;
                        return (
                            <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
                                <View className="flex-row justify-between items-start mb-3">
                                    <View className="flex-1 mr-3">
                                        <Text className="text-gray-900 font-bold text-base">
                                            {item.productDetail?.name ?? item.productCode}
                                        </Text>
                                        <Text className="text-gray-400 text-xs mt-0.5">Code: {item.productCode}</Text>
                                        {item.productDetail && (
                                            <Text className="text-indigo-500 text-xs mt-0.5">
                                                ${Number(item.productDetail.price).toFixed(2)}
                                            </Text>
                                        )}
                                    </View>
                                    <StockBadge qty={item.quantity} />
                                </View>
                                <View className="flex-row items-center justify-between pt-3 border-t border-gray-50">
                                    <Text className="text-gray-500 text-sm">Qty</Text>
                                    <View className="flex-row items-center gap-4">
                                        {isUpdating ? (
                                            <ActivityIndicator size="small" color="#6366f1" />
                                        ) : (
                                            <>
                                                <TouchableOpacity
                                                    onPress={() => updateQuantity(item, -1)}
                                                    className="w-9 h-9 bg-red-50 rounded-full items-center justify-center"
                                                >
                                                    <Text className="text-red-500 text-lg font-bold">−</Text>
                                                </TouchableOpacity>
                                                <Text className="text-gray-900 font-bold text-lg w-10 text-center">
                                                    {item.quantity}
                                                </Text>
                                                <TouchableOpacity
                                                    onPress={() => updateQuantity(item, 1)}
                                                    className="w-9 h-9 bg-green-50 rounded-full items-center justify-center"
                                                >
                                                    <Text className="text-green-600 text-lg font-bold">+</Text>
                                                </TouchableOpacity>
                                            </>
                                        )}
                                    </View>
                                    <Text className="text-gray-300 text-xs">
                                        {new Date(item.updatedAt).toLocaleDateString()}
                                    </Text>
                                </View>
                            </View>
                        );
                    }}
                />
            )}
        </SafeAreaView>
    );
}
