import React, { useState, useCallback } from 'react';
import Toast from './Toast';

export const ToastContext = React.createContext();

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now() + Math.random();
        const newToast = { id, message, type, duration };
        
        setToasts(prevToasts => [...prevToasts, newToast]);
        
        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, []);

    const showSuccess = useCallback((message) => addToast(message, 'success'), [addToast]);
    const showError = useCallback((message) => addToast(message, 'error'), [addToast]);
    const showWarning = useCallback((message) => addToast(message, 'warning'), [addToast]);
    const showInfo = useCallback((message) => addToast(message, 'info'), [addToast]);

    return (
        <ToastContext.Provider value={{ 
            addToast, 
            removeToast, 
            showSuccess, 
            showError, 
            showWarning, 
            showInfo 
        }}>
            {children}
            <div className="toast-container position-fixed top-0 end-0 p-3" style={{ zIndex: 1055 }}>
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        duration={toast.duration}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = React.useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
