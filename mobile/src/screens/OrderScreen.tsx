import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { orderService } from '../api/orderService';
import type { ProductOrder } from '../types/api';
import type { TabScreenProps } from '../types/navigation';

type Props = TabScreenProps<'Order'>;


export default function OrderScreen({ }: Props) {
    const [orders, setOrders] = useState<ProductOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useFocusEffect(
        useCallback(() => {
            fetchOrders();
        }, []),
    );

    const fetchOrders = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);
            setError(null);
            const data = await orderService.getAll();
            setOrders(data);
        } catch {
            setError('Failed to load orders. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="bg-white px-5 pt-4 pb-4 shadow-sm">
                <Text className="text-2xl font-bold text-gray-900">Orders 📋</Text>
                <Text className="text-sm text-gray-400 mt-1">
                    {loading ? 'Loading...' : `${orders.length} orders`}
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
                        onPress={() => fetchOrders()}
                        className="mt-4 bg-indigo-500 px-6 py-3 rounded-xl"
                    >
                        <Text className="text-white font-semibold">Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={item => String(item.id)}
                    contentContainerStyle={{ padding: 16 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => fetchOrders(true)}
                            colors={['#6366f1']}
                        />
                    }
                    ListEmptyComponent={
                        <View className="items-center mt-24">
                            <Text className="text-5xl">📋</Text>
                            <Text className="text-gray-500 mt-3 font-medium">No orders yet</Text>
                        </View>
                    }
                    renderItem={({ item }) => {
                        const statusStyle = STATUS_STYLE[item.status] ?? 'bg-gray-100 text-gray-600';
                        const [bgStyle, textStyle] = statusStyle.split(' ');
                        return (
                            <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
                                <View className="flex-row justify-between items-start">
                                    <View className="flex-1 mr-3">
                                        <Text className="text-gray-900 font-bold text-base">{item.orderNo}</Text>
                                        <Text className="text-gray-400 text-xs mt-0.5">
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    <View className={`${bgStyle} px-2 py-0.5 rounded-full`}>
                                        <Text className={`${textStyle} text-xs font-semibold`}>{item.status}</Text>
                                    </View>
                                </View>
                                <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-gray-50">
                                    <Text className="text-gray-500 text-sm">Total</Text>
                                    <Text className="text-indigo-600 font-bold">
                                        ${Number(item.totalAmount).toFixed(2)}
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

const STATUS_STYLE: Record<string, string> = {
    Pending: 'bg-yellow-100 text-yellow-700',
    Processing: 'bg-blue-100 text-blue-700',
    Completed: 'bg-green-100 text-green-700',
    Cancelled: 'bg-red-100 text-red-700',
};