import React from 'react';
import PropTypes from 'prop-types';

const DatePicker = ({ value, onChange, label, min, max, disabled }) => {
    const handleChange = (event) => {
        onChange(event.target.value);
    };

    const today = new Date().toISOString().split('T')[0];
    const minDate = min || '2020-01-01';
    const maxDate = max || today;

    return (
        <div className="mb-3">
            {label && <label htmlFor="date-picker" className="form-label">{label}</label>}
            <input
                id="date-picker"
                type="date"
                className="form-control"
                value={value}
                onChange={handleChange}
                min={minDate}
                max={maxDate}
                disabled={disabled}
            />
            <div className="form-text">
                Select date for currency rates (format: YYYY-MM-DD)
            </div>
        </div>
    );
};

DatePicker.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    label: PropTypes.string,
    min: PropTypes.string,
    max: PropTypes.string,
    disabled: PropTypes.bool,
};

DatePicker.defaultProps = {
    label: null,
    min: null,
    max: null,
    disabled: false,
};

export default DatePicker;
