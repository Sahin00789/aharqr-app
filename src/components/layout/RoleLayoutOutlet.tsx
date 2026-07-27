import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserPlus, 
  Utensils, 
  ClipboardList, 
  PlusCircle, 
  Bell, 
  User, 
  Flame, 
  Clock, 
  CheckCircle2, 
  History, 
  ShoppingBag, 
  Heart, 
  Boxes,
  UserCheck,
  ChefHat
} from 'lucide-react';

import DashboardLayout, { type NavItem } from './DashboardLayout';
import { useAuthStore } from '../../store/authStore';
import { useWebhookRoom } from '../../utils/useWebhookRoom';

/**
 * Restaurant Admin Master Layout Outlet
 * Single-Word Labels for Clean Premium UI
 */
export function AdminRoleLayout() {
  const { user } = useAuthStore();
  const location = useLocation();

  const adminNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, to: '/admin/dashboard' },
    { id: 'tables', label: 'Tables', icon: Utensils, to: '/admin/tables' },
    { id: 'orders', label: 'Orders', icon: ClipboardList, to: '/admin/orders', badge: 18 },
    { id: 'staff', label: 'Staff', icon: UserPlus, to: '/admin/staff' },
    { id: 'inventory', label: 'Inventory', icon: Boxes, to: '/admin/inventory' },
  ];

  const currentTab = adminNavItems.find(item => item.to && location.pathname.startsWith(item.to))?.id || 'dashboard';

  return (
    <DashboardLayout
      role="RESTAURANT_ADMIN"
      title={user?.name || 'Restaurant Admin'}
      subtitle={user?.email || 'Admin Portal'}
      navItems={adminNavItems}
      activeTab={currentTab}
    >
      <Outlet />
    </DashboardLayout>
  );
}

/**
 * Captain Master Layout Outlet
 * Single-Word Labels for Clean Premium UI
 */
export function CaptainRoleLayout() {
  const { user } = useAuthStore();
  const location = useLocation();

  const roomId = user?.restaurantId ? `restaurant-${user.restaurantId}` : 'captain-floor-room';
  const { isConnected: isWsConnected } = useWebhookRoom(roomId);

  // Live Shift Timer
  const [checkInTime] = useState<Date>(new Date(Date.now() - (3 * 3600 + 42 * 60) * 1000));
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const seconds = Math.floor((new Date().getTime() - checkInTime.getTime()) / 1000);
      setElapsedSeconds(seconds);
    }, 1000);
    return () => clearInterval(timer);
  }, [checkInTime]);

  const captainNavItems: NavItem[] = [
    { id: 'tables', label: 'Tables', icon: Utensils, to: '/captain/tables' },
    { id: 'orders', label: 'Orders', icon: ClipboardList, to: '/captain/orders', badge: 3 },
    { id: 'alerts', label: 'Alerts', icon: Bell, to: '/captain/alerts', badge: 2 },
    { id: 'new-order', label: 'Create', icon: PlusCircle, to: '/captain/tables' },
    { id: 'status', label: 'Shift', icon: UserCheck, to: '/captain/tables' },
  ];

  const currentTab = captainNavItems.find(item => item.to && location.pathname.startsWith(item.to))?.id || 'tables';

  return (
    <DashboardLayout
      role="CAPTAIN"
      title={user?.name || 'Captain Staff'}
      subtitle="Shift Active • Floor Operations"
      navItems={captainNavItems}
      activeTab={currentTab}
      checkInSeconds={elapsedSeconds}
    >
      <Outlet />
    </DashboardLayout>
  );
}

/**
 * Chef Master Layout Outlet
 * Single-Word Labels for Clean Premium UI
 */
export function ChefRoleLayout() {
  const { user } = useAuthStore();
  const location = useLocation();

  const roomId = user?.restaurantId ? `restaurant-${user.restaurantId}` : 'chef-kds-room';
  const { isConnected: isWsConnected } = useWebhookRoom(roomId);

  // Live Shift Timer
  const [checkInTime] = useState<Date>(new Date(Date.now() - (4 * 3600 + 15 * 60) * 1000));
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const seconds = Math.floor((new Date().getTime() - checkInTime.getTime()) / 1000);
      setElapsedSeconds(seconds);
    }, 1000);
    return () => clearInterval(timer);
  }, [checkInTime]);

  const chefNavItems: NavItem[] = [
    { id: 'kds', label: 'Board', icon: Flame, to: '/chef/kds', badge: 4 },
    { id: 'preparing', label: 'Cooking', icon: Clock, to: '/chef/kds' },
    { id: 'ready', label: 'Ready', icon: CheckCircle2, to: '/chef/kds' },
    { id: 'history', label: 'History', icon: History, to: '/chef/history' },
    { id: 'status', label: 'Profile', icon: ChefHat, to: '/chef/kds' },
  ];

  const currentTab = chefNavItems.find(item => item.to && location.pathname.startsWith(item.to))?.id || 'kds';

  return (
    <DashboardLayout
      role="CHEF"
      title={user?.name || 'Chef Staff'}
      subtitle="Shift Active • Kitchen Display System"
      navItems={chefNavItems}
      activeTab={currentTab}
      checkInSeconds={elapsedSeconds}
    >
      <Outlet />
    </DashboardLayout>
  );
}

/**
 * Customer Master Layout Outlet
 * Single-Word Labels for Clean Premium UI
 */
export function CustomerRoleLayout() {
  const { tableId } = useParams();
  const location = useLocation();

  const customerNavItems: NavItem[] = [
    { id: 'menu', label: 'Menu', icon: Utensils, to: `/menu/${tableId || 'table-1'}` },
    { id: 'favorites', label: 'Favorites', icon: Heart, to: `/menu/${tableId || 'table-1'}` },
    { id: 'cart', label: 'Cart', icon: ShoppingBag, to: '/checkout', badge: 2 },
    { id: 'status', label: 'Status', icon: Clock, to: '/checkout' },
    { id: 'profile', label: 'Profile', icon: User, to: `/menu/${tableId || 'table-1'}` },
  ];

  const currentTab = customerNavItems.find(item => item.to && location.pathname.startsWith(item.to))?.id || 'menu';

  return (
    <DashboardLayout
      role="CUSTOMER"
      title={`Spice Route • ${tableId ? tableId.replace('-', ' ') : 'Table 1'}`}
      subtitle="Scan & Order Live Table Service"
      navItems={customerNavItems}
      activeTab={currentTab}
    >
      <Outlet />
    </DashboardLayout>
  );
}
