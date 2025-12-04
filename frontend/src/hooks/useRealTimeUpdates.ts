import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import { updateComplaint } from '../store/slices/complaintSlice';

let socket: Socket | null = null;

export const useRealTimeUpdates = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Initialize socket connection
        if (!socket) {
            socket = io('https://janmat-backend.onrender.com', {
                auth: { token },
                transports: ['websocket', 'polling'],
            });

            socket.on('connect', () => {
                console.log('✅ Connected to real-time updates');
            });

            socket.on('disconnect', () => {
                console.log('❌ Disconnected from real-time updates');
            });

            socket.on('connect_error', (error) => {
                console.error('Connection error:', error);
            });
        }

        // Listen for complaint updates
        socket.on('complaintUpdated', (data) => {
            console.log('📢 Complaint updated:', data);
            dispatch(updateComplaint(data.complaint));
        });

        // Listen for new complaints
        socket.on('complaintCreated', (data) => {
            console.log('📢 New complaint created:', data);
            // You can dispatch an action to add the complaint to the list
        });

        // Listen for status changes
        socket.on('statusChanged', (data) => {
            console.log('📢 Status changed:', data);
            dispatch(updateComplaint(data.complaint));
        });

        return () => {
            if (socket) {
                socket.off('complaintUpdated');
                socket.off('complaintCreated');
                socket.off('statusChanged');
            }
        };
    }, [dispatch]);

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
