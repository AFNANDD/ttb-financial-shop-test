import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../types/navigation';
import ShopScreen from '../screens/ShopScreen';
import StockScreen from '../screens/StockScreen';
import OrderScreen from '../screens/OrderScreen';
import CartScreen from '../screens/CartScreen';

const Tab = createBottomTabNavigator<TabParamList>();

const TAB_ICONS: Record<string, string> = {
    Shop: '🛍️',
    Stock: '📦',
    Order: '📋',
    Cart: '🛒',
};

export default function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused }) => (
                    <Text className={focused ? 'text-2xl' : 'text-2xl opacity-40'}>
                        {TAB_ICONS[route.name]}
                    </Text>
                ),
            })}
        >
            <Tab.Screen name="Shop" component={ShopScreen} options={{ title: 'Shop' }} />
            <Tab.Screen name="Cart" component={CartScreen} options={{ title: 'Cart' }} />
            <Tab.Screen name="Stock" component={StockScreen} options={{ title: 'Stock' }} />
            <Tab.Screen name="Order" component={OrderScreen} options={{ title: 'Order' }} />
        </Tab.Navigator>
    );
}
