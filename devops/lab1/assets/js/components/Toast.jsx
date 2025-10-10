import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const Toast = ({ message, type = 'info', duration = 4000, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getToastClass = () => {
        const baseClass = 'toast fade';
        const typeClass = {
            success: 'border-success',
            error: 'border-danger', 
            warning: 'border-warning',
            info: 'border-info'
        }[type];
        
        return `${baseClass} ${typeClass} bg-white ${isVisible ? 'show' : ''}`;
    };

    return (
        <div className={getToastClass()} role="alert" style={{ minWidth: '300px' }}>
            <div className="toast-header">
                <strong className="me-auto">
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                </strong>
                <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => {
                        setIsVisible(false);
                        setTimeout(onClose, 300);
                    }}
                />
            </div>
            <div className="toast-body">
                {message}
            </div>
        </div>
    );
};

Toast.propTypes = {
    message: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
    duration: PropTypes.number,
    onClose: PropTypes.func.isRequired,
};

export default Toast;
