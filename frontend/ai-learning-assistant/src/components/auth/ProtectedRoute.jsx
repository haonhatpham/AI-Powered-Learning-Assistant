import React from 'react';
import AppLayout from '../layout/AppLayout';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const isAuthenticated = true; // Replace with actual authentication logic
    const loading = false; // Replace with actual loading state

    if (loading) {
        return <div>
            <p>Loading...</p>
        </div>
    }

    return isAuthenticated ? (
        <AppLayout>
            <Outlet />
        </AppLayout>
    ) : (
        <Navigate to="/login" replace />

    );
};
export default ProtectedRoute;