import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { UserRole, GameType } from '../../types';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: UserRole;
    requiredGameType?: GameType;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requiredRole,
    requiredGameType
}) => {
    const location = useLocation();
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userRole = localStorage.getItem('userRole') as UserRole;
    const userGameType = localStorage.getItem('userGameType') as GameType;

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // التحقق من الصلاحيات
    if (requiredRole && userRole !== UserRole.ADMIN && userRole !== requiredRole) {
        return <Navigate to="/unauthorized" replace />;
    }

    // التحقق من نوع اللعبة للمشرفين
    if (
        requiredGameType &&
        userRole === UserRole.SUPERVISOR &&
        userGameType !== requiredGameType
    ) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <>{children}</>;
};
