import React from 'react';
import PropTypes from 'prop-types';

const LoadingSkeleton = ({ variant = 'text', width = '100%', height = '1rem', className = '', count = 1 }) => {
    const getSkeletonClass = () => {
        const baseClass = 'placeholder-glow';
        const variantClass = {
            text: 'placeholder',
            card: 'card placeholder-glow',
            table: 'placeholder',
            button: 'btn placeholder',
            circle: 'placeholder rounded-circle'
        }[variant];
        
        return `${baseClass} ${variantClass} ${className}`;
    };

    const getSkeletonStyle = () => {
        const style = { width, height };
        
        if (variant === 'circle') {
            style.width = height;
            style.borderRadius = '50%';
        }
        
        return style;
    };

    if (variant === 'card') {
        return (
            <div className="card placeholder-glow mb-3" style={{ width }}>
                <div className="card-body">
                    <div className="placeholder col-7 mb-2"></div>
                    <div className="placeholder col-4 mb-2"></div>
                    <div className="placeholder col-4"></div>
                </div>
            </div>
        );
    }

    if (variant === 'table') {
        return (
            <tr className="placeholder-glow">
                <td><span className="placeholder col-8"></span></td>
                <td><span className="placeholder col-6"></span></td>
                <td><span className="placeholder col-4"></span></td>
            </tr>
        );
    }

    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <span
                    key={index}
                    className={getSkeletonClass()}
                    style={getSkeletonStyle()}
                >
                    {variant === 'button' && '\u00A0'}
                </span>
            ))}
        </>
    );
};

LoadingSkeleton.propTypes = {
    variant: PropTypes.oneOf(['text', 'card', 'table', 'button', 'circle']),
    width: PropTypes.string,
    height: PropTypes.string,
    className: PropTypes.string,
    count: PropTypes.number,
};

export default LoadingSkeleton;
