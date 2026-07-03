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
import { cartService } from '../api/cartService';
import { orderService } from '../api/orderService';
import { stockService } from '../api/stockService';
import type { ProductCartItem, ProductStock } from '../types/api';
import type { TabScreenProps } from '../types/navigation';

type Props = TabScreenProps<'Cart'>;

export default function CartScreen({ navigation }: Props) {
    const [items, setItems] = useState<ProductCartItem[]>([]);
    const [stockMap, setStockMap] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [ordering, setOrdering] = useState(false);
    const [clearing, setClearing] = useState(false);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const totalAmount = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    
    useFocusEffect(
        useCallback(() => {
            const load = async () => {
                setLoading(true);
                try {
                    const cartId = await cartService.ensureCart();
                    const [data, stocks] = await Promise.all([
                        cartService.getItems(cartId),
                        stockService.getAll(),
                    ]);
                    setItems(data);
                    const map: Record<string, number> = {};
                    stocks.forEach((s: ProductStock) => { map[s.productCode] = s.quantity; });
                    setStockMap(map);
                } catch {
                    setItems([]);
                } finally {
                    setLoading(false);
                }
            };
            load();
        }, []),
    );

    const handleUpdateQty = async (itemId: number, qty: number) => {
        setUpdatingId(itemId);
        try {
            const item = items.find(i => i.id === itemId);
            if (!item) return;
            if (qty <= 0) {
                await cartService.removeItem(itemId);
                setItems(prev => prev.filter(i => i.id !== itemId));
            } else {
                await cartService.updateItem(itemId, qty, item.unitPrice);
                setItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: qty } : i));
            }
        } finally {
            setUpdatingId(null);
        }
    };

    const handleRemove = async (itemId: number) => {
        setUpdatingId(itemId);
        try {
            await cartService.removeItem(itemId);
            setItems(prev => prev.filter(i => i.id !== itemId));
        } finally {
            setUpdatingId(null);
        }
    };

    const handleClearAll = () => {
        if (items.length === 0 || clearing || ordering) return;

        Alert.alert('ลบทุกรายการ', 'ต้องการลบสินค้าทั้งหมดออกจากตะกร้าหรือไม่?', [
            { text: 'ยกเลิก', style: 'cancel' },
            {
                text: 'ลบทั้งหมด',
                style: 'destructive',
                onPress: async () => {
                    setClearing(true);
                    try {
                        await Promise.all(items.map(item => cartService.removeItem(item.id)));
                        setItems([]);
                    } catch {
                        Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถลบทุกรายการได้ กรุณาลองใหม่');
                    } finally {
                        setClearing(false);
                    }
                },
            },
        ]);
    };

    const handlePlaceOrder = () => {
        if (items.length === 0) return;
        Alert.alert('ยืนยันการสั่งซื้อ', `ยอดรวม $${totalAmount.toFixed(2)}`, [
            { text: 'ยกเลิก', style: 'cancel' },
            {
                text: 'สั่งซื้อ',
                onPress: async () => {
                    setOrdering(true);
                    try {
                        const order = await orderService.create({
                            userId: 1,
                            orderNo: `ORD-${Date.now()}`,
                            totalAmount,
                        });
                        for (const item of items) {
                            await orderService.createItem({
                                orderId: order.id,
                                productCode: item.productCode,
                                quantity: item.quantity,
                            });
                        }
                        const cartId = cartService.getCartId();
                        if (cartId) {
                            await cartService.closeCart(cartId);
                        } else {
                            cartService.clearCartId();
                        }
                        setItems([]);
                        Alert.alert('สั่งซื้อสำเร็จ! 🎉', `Order No: ${order.orderNo}`, [
                            { text: 'ดูรายการสั่งซื้อ', onPress: () => navigation.navigate('Order') },
                            { text: 'ช้อปต่อ', onPress: () => navigation.navigate('Shop') },
                        ]);
                    } catch {
                        Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถสั่งซื้อได้ กรุณาลองใหม่');
                    } finally {
                        setOrdering(false);
                    }
                },
            },
        ]);
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="bg-white px-5 pt-4 pb-4 shadow-sm">
                <Text className="text-2xl font-bold text-gray-900">Cart 🛒</Text>
                <Text className="text-sm text-gray-400 mt-1">
                    {loading ? 'Loading...' : itemCount > 0 ? `${itemCount} items` : 'ตะกร้าว่าง'}
                </Text>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#6366f1" />
                </View>
            ) : items.length === 0 ? (
                <View className="flex-1 items-center justify-center px-8">
                    <Text className="text-7xl">🛒</Text>
                    <Text className="text-gray-700 font-bold text-xl mt-4">ตะกร้าว่างเปล่า</Text>
                    <Text className="text-gray-400 text-sm mt-2 text-center">
                        กดปุ่ม Add to Cart ในหน้า Shop เพื่อเพิ่มสินค้า
                    </Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Shop')}
                        className="mt-6 bg-indigo-500 px-8 py-3 rounded-2xl"
                    >
                        <Text className="text-white font-bold">ไปหน้า Shop →</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <FlatList
                        data={items}
                        keyExtractor={item => String(item.id)}
                        contentContainerStyle={{ padding: 16 }}
                        refreshControl={
                            <RefreshControl
                                refreshing={false}
                                onRefresh={async () => {
                                    const cartId = cartService.getCartId();
                                    if (cartId) setItems(await cartService.getItems(cartId));
                                }}
                                colors={['#6366f1']}
                            />
                        }
                        renderItem={({ item }) => {
                            const isUpdating = updatingId === item.id;
                            const stockQty = stockMap[item.productCode] ?? 0;
                            const atStockLimit = item.quantity >= stockQty;
                            return (
                                <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
                                    <View className="flex-row justify-between items-start mb-3">
                                        <View className="flex-1 mr-2">
                                            <Text className="text-gray-900 font-bold text-base" numberOfLines={1}>
                                                {item.productDetail?.name ?? item.productCode}
                                            </Text>
                                            <Text className="text-gray-400 text-xs mt-0.5">Code: {item.productCode}</Text>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => handleRemove(item.id)}
                                            disabled={isUpdating}
                                            className="bg-red-50 px-2 py-1 rounded-lg"
                                        >
                                            <Text className="text-red-400 text-xs font-medium">ลบ</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View className="flex-row justify-between items-center pt-3 border-t border-gray-50">
                                        <View className="flex-row items-center gap-3">
                                            {isUpdating ? (
                                                <ActivityIndicator size="small" color="#6366f1" />
                                            ) : (
                                                <>
                                                    <TouchableOpacity
                                                        onPress={() => handleUpdateQty(item.id, item.quantity - 1)}
                                                        className="w-9 h-9 bg-red-50 rounded-full items-center justify-center"
                                                    >
                                                        <Text className="text-red-500 text-lg font-bold">−</Text>
                                                    </TouchableOpacity>
                                                    <Text className="text-gray-900 font-bold text-lg w-8 text-center">
                                                        {item.quantity}
                                                    </Text>
                                                    <TouchableOpacity
                                                        onPress={() => handleUpdateQty(item.id, item.quantity + 1)}
                                                        disabled={atStockLimit}
                                                        className={`w-9 h-9 rounded-full items-center justify-center ${atStockLimit ? 'bg-gray-100' : 'bg-green-50'}`}
                                                    >
                                                        <Text className={`text-lg font-bold ${atStockLimit ? 'text-gray-300' : 'text-green-600'}`}>+</Text>
                                                    </TouchableOpacity>
                                                </>
                                            )}
                                        </View>
                                        <View className="items-end">
                                            <Text className="text-indigo-600 font-bold text-base">
                                                ${(item.unitPrice * item.quantity).toFixed(2)}
                                            </Text>
                                            <Text className="text-gray-400 text-xs">
                                                ${Number(item.unitPrice).toFixed(2)} / unit
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            );
                        }}
                    />
                    <View className="bg-white px-5 pb-6 pt-4 border-t border-gray-100">
                        <View className="flex-row justify-between mb-1">
                            <Text className="text-gray-500">จำนวนรายการ</Text>
                            <Text className="text-gray-700 font-medium">{items.length} รายการ</Text>
                        </View>
                        <View className="flex-row justify-between mb-4">
                            <Text className="text-gray-500">จำนวนสินค้า</Text>
                            <Text className="text-gray-700 font-medium">{itemCount} ชิ้น</Text>
                        </View>
                        <View className="flex-row justify-between mb-5">
                            <Text className="text-gray-900 font-bold text-lg">ยอดรวม</Text>
                            <Text className="text-indigo-600 font-bold text-xl">${totalAmount.toFixed(2)}</Text>
                        </View>
                        <TouchableOpacity
                            onPress={handleClearAll}
                            disabled={clearing || ordering}
                            className={`py-3 rounded-2xl items-center mb-3 ${clearing || ordering ? 'bg-red-300' : 'bg-red-500'}`}
                        >
                            {clearing ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold text-base">ลบทุกรายการ</Text>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handlePlaceOrder}
                            disabled={ordering || clearing}
                            className={`py-4 rounded-2xl items-center ${ordering || clearing ? 'bg-indigo-300' : 'bg-indigo-500'}`}
                        >
                            {ordering ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold text-base">สั่งซื้อ →</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </SafeAreaView>
    );
}