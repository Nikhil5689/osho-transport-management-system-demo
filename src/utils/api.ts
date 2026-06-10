import { supabase } from './supabase';
import toast from 'react-hot-toast';
import { generateRealisticDemoData } from './demoData';

const defaultSettings = {
  id: 'default',
  name: 'OSHO Transport Chhattisgarh',
  address: 'Transport Nagar, Raipur',
  city: 'Raipur',
  state: 'Chhattisgarh',
  phone: '9876543210',
  phone2: '9876543211',
  gst: '22AAAAA0000A1Z5',
  prefix: 'OSHO-',
  startingNumber: 1001,
  defaultFreight: 0,
  defaultHamali: 0,
  defaultDocket: 50,
  terms: 'Goods once booked will not be returned. Company not responsible for leakage or breakage. All disputes subject to Raipur jurisdiction.',
};

let authUser: { id: string; username: string } | null = null;

// Load token and user from localStorage on app init
if (typeof window !== 'undefined') {
  const storedUser = localStorage.getItem('auth_user');
  authUser = storedUser ? JSON.parse(storedUser) : null;
}

// Check if we are running in Demo Mode
export const isDemoMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('is_demo_mode') === 'true';
};

// Initialize or get demo data from local storage
export const ensureDemoData = () => {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem('demo_clients')) {
    const data = generateRealisticDemoData();
    localStorage.setItem('demo_clients', JSON.stringify(data.clients));
    localStorage.setItem('demo_bookings', JSON.stringify(data.bookings));
    localStorage.setItem('demo_payments', JSON.stringify(data.payments));
    localStorage.setItem('demo_settings', JSON.stringify(data.settings));
  }
};

// Reset demo data to a new randomized dataset
export const resetDemoData = () => {
  if (typeof window === 'undefined') return;
  const data = generateRealisticDemoData();
  localStorage.setItem('demo_clients', JSON.stringify(data.clients));
  localStorage.setItem('demo_bookings', JSON.stringify(data.bookings));
  localStorage.setItem('demo_payments', JSON.stringify(data.payments));
  localStorage.setItem('demo_settings', JSON.stringify(data.settings));
};

// Helper getters/setters for local storage
const getLocalData = (key: string): any[] => {
  ensureDemoData();
  const val = localStorage.getItem(key);
  return val ? JSON.parse(val) : [];
};

const setLocalData = (key: string, data: any[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    // Demo Login check
    if (username.toLowerCase() === 'demo' && password === 'demo') {
      localStorage.setItem('is_demo_mode', 'true');
      ensureDemoData();
      
      const user = { id: 'demo_user', username: 'Demo Admin' };
      authUser = user;
      localStorage.setItem('auth_token', 'demo-mock-token');
      localStorage.setItem('auth_user', JSON.stringify(user));
      return { token: 'demo-mock-token', user };
    }

    // Basic auth check for demo/migration purposes
    if (username === 'rishabh' && password === 'Rishabh5689') {
        const user = { id: 'user_rishabh', username: 'rishabh' };
        authUser = user;
        localStorage.setItem('is_demo_mode', 'false');
        localStorage.setItem('auth_token', 'supabase-mock-token');
        localStorage.setItem('auth_user', JSON.stringify(user));
        return { token: 'supabase-mock-token', user };
    }
    
    // Attempt Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
        email: username,
        password: password,
    });
    
    if (error || !data.user) {
        throw new Error(error?.message || 'Invalid username or password');
    }
    
    const user = { id: data.user.id, username: data.user.email || username };
    authUser = user;
    localStorage.setItem('is_demo_mode', 'false');
    localStorage.setItem('auth_token', data.session.access_token);
    localStorage.setItem('auth_user', JSON.stringify(user));
    return { token: data.session.access_token, user };
  },

  logout: async () => {
    if (!isDemoMode()) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Supabase logout failed:', err);
      }
    }
    authUser = null;
    localStorage.removeItem('is_demo_mode');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },

  getToken: () => localStorage.getItem('auth_token'),
  getUser: () => authUser,
};

// Clients API
export const clientsAPI = {
  getAll: async () => {
    if (isDemoMode()) {
      return getLocalData('demo_clients');
    }
    const { data, error } = await supabase.from('clients').select('*').order('createdAt', { ascending: false });
    if (error) {
        console.error('Clients fetch error:', error);
        return [];
    }
    return data || [];
  },

  create: async (client: any) => {
    const clientData = { ...client, id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, createdAt: new Date().toISOString() };
    
    if (isDemoMode()) {
      const list = getLocalData('demo_clients');
      list.unshift(clientData);
      setLocalData('demo_clients', list);
      return clientData;
    }

    const { data, error } = await supabase.from('clients').insert([clientData]).select().single();
    if (error) {
        console.error('Error creating client:', error);
        return clientData; // Fallback so UI doesn't break if table doesn't exist
    }
    return data || clientData;
  },

  update: async (id: string, client: any) => {
    if (isDemoMode()) {
      const list = getLocalData('demo_clients');
      const updated = list.map((c) => (c.id === id ? { ...c, ...client } : c));
      setLocalData('demo_clients', updated);
      return updated.find((c) => c.id === id) || client;
    }

    const { data, error } = await supabase.from('clients').update(client).eq('id', id).select().single();
    if (error) {
        console.error('Error updating client:', error);
        return client;
    }
    return data || client;
  },

  delete: async (id: string) => {
    if (isDemoMode()) {
      const list = getLocalData('demo_clients');
      const filtered = list.filter((c) => c.id !== id);
      setLocalData('demo_clients', filtered);
      return { success: true };
    }

    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) {
        console.error('Error deleting client:', error);
        return { success: false, error };
    }
    return { success: true };
  },
};

// Bookings API
export const bookingsAPI = {
  getAll: async () => {
    if (isDemoMode()) {
      return getLocalData('demo_bookings');
    }
    const { data, error } = await supabase.from('bookings').select('*').order('createdAt', { ascending: false });
    if (error) {
        console.error('Bookings fetch error:', error);
        return [];
    }
    return data || [];
  },

  create: async (booking: any) => {
    try {
      if (booking.invoiceNo) {
        if (isDemoMode()) {
          const list = getLocalData('demo_bookings');
          const existing = list.find((b) => b.invoiceNo === booking.invoiceNo);
          if (existing) {
            throw new Error(`Invoice number ${booking.invoiceNo} already exists!`);
          }
        } else {
          const { data: existing } = await supabase.from('bookings').select('id').eq('invoiceNo', booking.invoiceNo).maybeSingle();
          if (existing) {
            throw new Error(`Invoice number ${booking.invoiceNo} already exists!`);
          }
        }
      }

      const wayBillNo = await bookingsAPI.getNextWayBillNo();
      const bookingData = { 
        ...booking, 
        id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, 
        wayBillNo, 
        createdAt: new Date().toISOString() 
      };

      if (isDemoMode()) {
        const list = getLocalData('demo_bookings');
        list.unshift(bookingData);
        setLocalData('demo_bookings', list);
        return bookingData;
      }
      
      const { data, error } = await supabase.from('bookings').insert([bookingData]).select().single();
      
      if (error) {
        console.error('Supabase Insert Error:', error);
        toast.error(`Database Error: ${error.message}`);
        throw error;
      }
      return data;
    } catch (err: any) {
      console.error('Booking Creation Failed:', err);
      toast.error(err.message || 'Failed to save booking');
      throw err;
    }
  },

  update: async (id: string, booking: any) => {
    try {
      if (booking.invoiceNo) {
        if (isDemoMode()) {
          const list = getLocalData('demo_bookings');
          const existing = list.find((b) => b.invoiceNo === booking.invoiceNo && b.id !== id);
          if (existing) {
            throw new Error(`Invoice number ${booking.invoiceNo} already exists!`);
          }
        } else {
          const { data: existing } = await supabase.from('bookings').select('id').eq('invoiceNo', booking.invoiceNo).maybeSingle();
          if (existing && existing.id !== id) {
            throw new Error(`Invoice number ${booking.invoiceNo} already exists!`);
          }
        }
      }

      if (isDemoMode()) {
        const list = getLocalData('demo_bookings');
        const updated = list.map((b) => (b.id === id ? { ...b, ...booking } : b));
        setLocalData('demo_bookings', updated);
        return updated.find((b) => b.id === id);
      }

      const { data, error } = await supabase.from('bookings').update(booking).eq('id', id).select().single();
      if (error) {
        toast.error(`Update Error: ${error.message}`);
        throw error;
      }
      return data;
    } catch (err: any) {
      toast.error(err.message || 'Failed to update booking');
      throw err;
    }
  },

  delete: async (id: string) => {
    if (isDemoMode()) {
      const bookingsList = getLocalData('demo_bookings');
      setLocalData('demo_bookings', bookingsList.filter((b) => b.id !== id));

      const paymentsList = getLocalData('demo_payments');
      setLocalData('demo_payments', paymentsList.filter((p) => p.bookingId !== id));

      return { success: true };
    }

    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (error) {
        console.error('Error deleting booking:', error);
        return { success: false, error };
    }
    return { success: true };
  },

  getNextWayBillNo: async () => {
    try {
        let prefix = defaultSettings.prefix;
        let startingNumber = defaultSettings.startingNumber;

        if (isDemoMode()) {
          const settings = getLocalData('demo_settings');
          const bookings = getLocalData('demo_bookings');
          
          if (settings && !Array.isArray(settings)) {
            const s = settings as any;
            prefix = s.prefix || prefix;
            startingNumber = s.startingNumber || startingNumber;
          }

          let maxNumber = startingNumber - 1;
          if (bookings && bookings.length > 0) {
            bookings.forEach((b: any) => {
              const match = b.wayBillNo?.match(/(\d+)$/);
              if (match) {
                const num = parseInt(match[1], 10);
                if (!isNaN(num) && num > maxNumber) maxNumber = num;
              }
            });
          }
          return `${prefix}${maxNumber + 1}`;
        } else {
          const { data: settingsData } = await supabase.from('settings').select('*').single();
          prefix = settingsData?.prefix || prefix;
          startingNumber = settingsData?.startingNumber || startingNumber;
          
          const { data: bookings, error } = await supabase.from('bookings').select('wayBillNo');
          if (error) throw error;

          let maxNumber = startingNumber - 1;
          
          if (bookings && bookings.length > 0) {
              bookings.forEach((b: any) => {
                  const match = b.wayBillNo?.match(/(\d+)$/);
                  if (match) {
                      const num = parseInt(match[1], 10);
                      if (!isNaN(num) && num > maxNumber) maxNumber = num;
                  }
              });
          }
          return `${prefix}${maxNumber + 1}`;
        }
    } catch (err) {
        console.error('Error in getNextWayBillNo:', err);
        return `OSHO-${Date.now()}`;
    }
  },
};

// Payments API
export const paymentsAPI = {
  getAll: async () => {
    if (isDemoMode()) {
      return getLocalData('demo_payments');
    }
    const { data, error } = await supabase.from('payments').select('*').order('createdAt', { ascending: false });
    if (error) {
        console.error('Payments fetch error:', error);
        return [];
    }
    return data || [];
  },

  create: async (payment: any) => {
    try {
      const paymentData = { 
        ...payment, 
        id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, 
        createdAt: new Date().toISOString() 
      };

      if (isDemoMode()) {
        const list = getLocalData('demo_payments');
        list.unshift(paymentData);
        setLocalData('demo_payments', list);
        return paymentData;
      }

      const { data, error } = await supabase.from('payments').insert([paymentData]).select().single();
      if (error) {
        toast.error(`Payment Error: ${error.message}`);
        throw error;
      }
      return data;
    } catch (err: any) {
      toast.error(err.message || 'Failed to save payment');
      throw err;
    }
  },

  update: async (id: string, payment: any) => {
    if (isDemoMode()) {
      const list = getLocalData('demo_payments');
      const updated = list.map((p) => (p.id === id ? { ...p, ...payment } : p));
      setLocalData('demo_payments', updated);
      return updated.find((p) => p.id === id) || payment;
    }

    const { data, error } = await supabase.from('payments').update(payment).eq('id', id).select().single();
    if (error) {
        console.error('Error updating payment:', error);
        return payment;
    }
    return data || payment;
  },

  delete: async (id: string) => {
    if (isDemoMode()) {
      const list = getLocalData('demo_payments');
      setLocalData('demo_payments', list.filter((p) => p.id !== id));
      return { success: true };
    }

    const { error } = await supabase.from('payments').delete().eq('id', id);
    if (error) {
        console.error('Error deleting payment:', error);
        return { success: false, error };
    }
    return { success: true };
  },
};

// Settings API
export const settingsAPI = {
  get: async () => {
    if (isDemoMode()) {
      ensureDemoData();
      const s = localStorage.getItem('demo_settings');
      return s ? JSON.parse(s) : defaultSettings;
    }

    const { data, error } = await supabase.from('settings').select('*').single();
    if (error || !data) {
        return defaultSettings;
    }
    return data;
  },

  update: async (settings: any) => {
    if (isDemoMode()) {
      ensureDemoData();
      const current = JSON.parse(localStorage.getItem('demo_settings') || '{}');
      const updated = { ...current, ...settings };
      localStorage.setItem('demo_settings', JSON.stringify(updated));
      return updated;
    }

    const { data: existingData } = await supabase.from('settings').select('id').single();
    
    if (existingData) {
        const { data, error } = await supabase.from('settings').update(settings).eq('id', existingData.id).select().single();
        if (error) {
            console.error('Error updating settings:', error);
            return settings;
        }
        return data || settings;
    } else {
        const { data, error } = await supabase.from('settings').insert([{ ...settings, id: 'default' }]).select().single();
        if (error) {
            console.error('Error inserting settings:', error);
            return settings;
        }
        return data || settings;
    }
  },
};
