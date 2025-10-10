import React from 'react';
import PropTypes from 'prop-types';

const CURRENCY_NAMES = {
    EUR: 'Euro',
    USD: 'US Dollar',
    CZK: 'Czech Koruna',
    IDR: 'Indonesian Rupiah',
    BRL: 'Brazilian Real',
};

const CurrencySelect = ({ value, onChange, currencies, label, disabled }) => {
    const handleChange = (event) => {
        onChange(event.target.value);
    };

    return (
        <div className="mb-3">
            {label && <label htmlFor="currency-select" className="form-label">{label}</label>}
            <select
                id="currency-select"
                className="form-select"
                value={value}
                onChange={handleChange}
                disabled={disabled}
            >
                {currencies.map((currency) => (
                    <option key={currency} value={currency}>
                        {currency} - {CURRENCY_NAMES[currency] || currency}
                    </option>
                ))}
            </select>
        </div>
    );
};

CurrencySelect.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    currencies: PropTypes.arrayOf(PropTypes.string),
    label: PropTypes.string,
    disabled: PropTypes.bool,
};

CurrencySelect.defaultProps = {
    currencies: ['EUR', 'USD', 'CZK', 'IDR', 'BRL'],
    label: null,
    disabled: false,
};

export default CurrencySelect;
