import { supabase } from '../lib/supabase';
import type { ApiResponse } from '../types/requisition';

export interface Notification {
    id: string;
    user_id: string;
    type: 'info' | 'warning' | 'success' | 'error' | 'reminder' | 'system';
    title: string;
    message: string;
    is_read: boolean;
    link?: string;
    created_at: string;
    metadata?: any;
}

export const fetchNotifications = async (userId: string, limit = 50): Promise<ApiResponse<Notification[]>> => {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return { success: true, data };
    } catch (error: any) {
        console.error('Fetch Notifications Error:', error);
        return { success: false, error: error.message };
    }
};

export const markAsRead = async (notificationId: string): Promise<ApiResponse<void>> => {
    try {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const markAllAsRead = async (userId: string): Promise<ApiResponse<void>> => {
    try {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('is_read', false);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const subscribeToNotifications = (userId: string, onNotification: (notification: Notification) => void) => {
    return supabase
        .channel(`notifications:user_id=eq.${userId}`)
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`
        }, payload => {
            onNotification(payload.new as Notification);
        })
        .subscribe();
};
