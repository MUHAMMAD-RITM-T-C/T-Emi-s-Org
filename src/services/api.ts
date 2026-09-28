import { supabase } from '../lib/supabaseClient';
import { Order, AuthUser, OrderMessage } from '../types';

// Check if backend API is reachable or if running in static environment (GitHub Pages)
export async function checkBackendReachable(): Promise<boolean> {
  try {
    const res = await fetch('/api/status', { method: 'GET', signal: AbortSignal.timeout(1500) });
    return res.ok;
  } catch (e) {
    return false;
  }
}

// 1. Fetch Orders
export async function getOrders(status?: string): Promise<{ success: boolean; orders: Order[] }> {
  try {
    const res = await fetch(`/api/orders${status ? `?status=${status}` : ''}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success) return data;
    }
  } catch (e) {
    // Fallback to Supabase directly
  }

  try {
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    const { data, error } = await query;
    if (error) throw error;
    return { success: true, orders: (data || []) as Order[] };
  } catch (err: any) {
    return { success: false, orders: [] };
  }
}

// 2. Create Order
export async function createOrder(orderData: Partial<Order>): Promise<{ success: boolean; order?: Order; error?: string }> {
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) return data;
    }
  } catch (e) {
    // Fallback to Supabase
  }

  try {
    const trackingCode = 'RTM-' + Math.floor(100000 + Math.random() * 900000);
    const newOrder = {
      ...orderData,
      tracking_code: trackingCode,
      status: 'new',
      platform: 'web',
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('orders').insert([newOrder]).select().single();
    if (error) throw error;
    return { success: true, order: data as Order };
  } catch (err: any) {
    return { success: false, error: err.message || 'خطا در ثبت سفارش' };
  }
}

// 3. Update Order Status
export async function updateOrderStatus(id: string, status: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    // Fallback
  }

  try {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 4. Client Login
export async function clientLogin(phone: string, username?: string): Promise<{ success: boolean; user?: AuthUser; orders?: Order[]; error?: string }> {
  try {
    const res = await fetch('/api/auth/client-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, username }),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    // Fallback
  }

  try {
    const cleanPhone = phone.trim();
    let { data: user } = await supabase.from('users').select('*').eq('phone', cleanPhone).maybeSingle();

    if (!user) {
      const { data: newUser, error: createErr } = await supabase
        .from('users')
        .insert([{ phone: cleanPhone, username: username || `کاربر_${cleanPhone.slice(-4)}`, role: 'client' }])
        .select()
        .single();
      if (createErr) throw createErr;
      user = newUser;
    }

    const { data: orders } = await supabase.from('orders').select('*').eq('phone', cleanPhone).order('created_at', { ascending: false });

    return {
      success: true,
      user: user as AuthUser,
      orders: (orders || []) as Order[],
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'خطا در ورود' };
  }
}

// 5. Client Register
export async function clientRegister(name: string, phone: string, username: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    const res = await fetch('/api/auth/client-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, username }),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    // Fallback
  }

  try {
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{ name, phone: phone.trim(), username: username.trim(), role: 'client' }])
      .select()
      .single();
    if (error) throw error;
    return { success: true, user: newUser as AuthUser };
  } catch (err: any) {
    return { success: false, error: err.message || 'خطا در ثبت‌نام' };
  }
}

// 6. Admin Login
export async function adminLogin(password: string): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    const res = await fetch('/api/auth/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    // Fallback directly
  }

  if (password === 'Mohmah123') {
    return { success: true, token: 'admin_session_' + Date.now() };
  }
  return { success: false, error: 'رمز عبور مدیریت نادرست است' };
}

// 7. Messages
export async function getOrderMessages(orderId: string): Promise<{ success: boolean; messages: OrderMessage[] }> {
  try {
    const res = await fetch(`/api/orders/${orderId}/messages`);
    if (res.ok) return await res.json();
  } catch (e) {
    // Fallback
  }

  try {
    const { data, error } = await supabase
      .from('order_messages')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return { success: true, messages: (data || []) as OrderMessage[] };
  } catch (err: any) {
    return { success: false, messages: [] };
  }
}

export async function sendOrderMessage(orderId: string, senderRole: 'admin' | 'client', message: string): Promise<{ success: boolean; message?: OrderMessage }> {
  try {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, senderRole, message }),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    // Fallback
  }

  try {
    const { data, error } = await supabase
      .from('order_messages')
      .insert([{ order_id: orderId, sender_role: senderRole, message }])
      .select()
      .single();
    if (error) throw error;
    return { success: true, message: data as OrderMessage };
  } catch (err: any) {
    return { success: false };
  }
}
