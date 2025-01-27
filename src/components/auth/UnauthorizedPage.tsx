import React from 'react';
import { useNavigate } from 'react-router-dom';

export const UnauthorizedPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg text-center">
                <div className="text-6xl text-red-500 mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    غير مصرح بالوصول
                </h2>
                <p className="text-gray-600 mb-8">
                    عذراً، ليس لديك الصلاحيات الكافية للوصول إلى هذه الصفحة
                </p>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    العودة إلى لوحة التحكم
                </button>
            </div>
        </div>
    );
};
