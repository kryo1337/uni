import React, { useState, useCallback, useEffect } from 'react';
import CurrencySelect from './CurrencySelect';
import DatePicker from './DatePicker';
import LoadingSkeleton from './LoadingSkeleton';
import { useToast } from './ToastManager';
import { useCantorQuote } from '../hooks';

const CURRENCY_NAMES = {
    EUR: 'Euro',
    USD: 'US Dollar',
    CZK: 'Czech Koruna',
    IDR: 'Indonesian Rupiah',
    BRL: 'Brazilian Real',
};

const FULL_SUPPORT_CURRENCIES = ['EUR', 'USD'];
const SELL_ONLY_CURRENCIES = ['CZK', 'IDR', 'BRL'];

const CantorQuote = React.memo(() => {
    const [selectedCurrency, setSelectedCurrency] = useState('EUR');
    const [selectedSide, setSelectedSide] = useState('sell');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [validationErrors, setValidationErrors] = useState({});
    
    const { showSuccess, showError, showWarning, showInfo } = useToast();
    
    const { data: quote, loading, error, refetch } = useCantorQuote(
        selectedCurrency, 
        selectedSide, 
        selectedDate
    );

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleRefresh();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                handleClear();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (error) {
            showError(`Failed to get quote: ${error}`);
        }
    }, [error, showError]);

    const validateForm = useCallback(() => {
        const errors = {};
        
        if (!selectedCurrency) {
            errors.currency = 'Please select a currency';
        }
        
        if (!selectedSide) {
            errors.side = 'Please select transaction type';
        }
        
        if (selectedSide === 'buy' && SELL_ONLY_CURRENCIES.includes(selectedCurrency)) {
            errors.side = 'BUY operation not available for this currency';
        }
        
        const selectedDateObj = new Date(selectedDate);
        const today = new Date();
        if (selectedDateObj > today) {
            errors.date = 'Cannot select future dates';
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    }, [selectedCurrency, selectedSide, selectedDate]);

    const handleCurrencyChange = useCallback((currency) => {
        setSelectedCurrency(currency);
        if (SELL_ONLY_CURRENCIES.includes(currency) && selectedSide === 'buy') {
            setSelectedSide('sell');
            showWarning(`Switched to SELL - BUY not available for ${currency}`);
        }
        setValidationErrors(prev => ({ ...prev, currency: '' }));
    }, [selectedSide, showWarning]);

    const handleSideChange = useCallback((side) => {
        setSelectedSide(side);
        setValidationErrors(prev => ({ ...prev, side: '' }));
    }, []);

    const handleDateChange = useCallback((date) => {
        setSelectedDate(date);
        setValidationErrors(prev => ({ ...prev, date: '' }));
    }, []);

    const handleRefresh = useCallback(() => {
        if (validateForm()) {
            refetch();
            showSuccess(`Quote refreshed for ${selectedCurrency} ${selectedSide.toUpperCase()}`);
        }
    }, [validateForm, refetch, selectedCurrency, selectedSide, showSuccess]);

    const handleClear = useCallback(() => {
        setSelectedCurrency('EUR');
        setSelectedSide('sell');
        setSelectedDate(new Date().toISOString().split('T')[0]);
        setValidationErrors({});
        showInfo('Form cleared');
    }, [showInfo]);

    const formatRate = (rate) => {
        return rate ? rate.toFixed(4) : '—';
    };

    const calculateMargin = () => {
        if (!quote) return null;
        const margin = quote.price - quote.nbpMid;
        return margin;
    };

    const isBuyDisabled = SELL_ONLY_CURRENCIES.includes(selectedCurrency);

    return (
        <div className="dashboard-container">
            <h1 className="text-center dashboard-title">Exchange Rate Calculator</h1>
            
            <div className="row mb-5">
                <div className="col-md-4 mb-3">
                    <div className="date-picker-container">
                        <CurrencySelect
                            value={selectedCurrency}
                            onChange={handleCurrencyChange}
                            label="Select Currency"
                        />
                    </div>
                </div>
                <div className="col-md-4 mb-3">
                    <div className="date-picker-container">
                        <label className="form-label">Transaction Type</label>
                        <div className="mt-3">
                            <div className="form-check form-check-inline">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="transactionSide"
                                    id="buy-radio"
                                    value="buy"
                                    checked={selectedSide === 'buy'}
                                    onChange={(e) => handleSideChange(e.target.value)}
                                    disabled={isBuyDisabled}
                                />
                                <label 
                                    className={`form-check-label ${isBuyDisabled ? 'text-muted' : ''}`} 
                                    htmlFor="buy-radio"
                                >
                                    BUY {isBuyDisabled && '(Not available)'}
                                </label>
                            </div>
                            <div className="form-check form-check-inline">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="transactionSide"
                                    id="sell-radio"
                                    value="sell"
                                    checked={selectedSide === 'sell'}
                                    onChange={(e) => handleSideChange(e.target.value)}
                                />
                                <label className="form-check-label" htmlFor="sell-radio">
                                    SELL
                                </label>
                            </div>
                        </div>
                        {isBuyDisabled && selectedSide === 'buy' && (
                            <small className="text-warning d-block mt-2">
                                BUY operations available only for EUR and USD
                            </small>
                        )}
                    </div>
                </div>
                <div className="col-md-4 mb-3">
                    <div className="date-picker-container">
                        <DatePicker
                            value={selectedDate}
                            onChange={handleDateChange}
                            label="Exchange Date"
                        />
                    </div>
                </div>
            </div>

            <div className="row mb-3">
                <div className="col-12 d-flex justify-content-between align-items-center">
                    <h4>
                        {selectedSide.toUpperCase()} {selectedCurrency} - {CURRENCY_NAMES[selectedCurrency]}
                    </h4>
                    <div className="d-flex gap-2">
                            <button
                                className="btn btn-outline-primary"
                                onClick={handleRefresh}
                                disabled={loading}
                                title="Refresh Quote (Ctrl+Enter)"
                            >
                                Refresh Quote
                            </button>
                            <button
                                className="btn btn-outline-secondary"
                                onClick={handleClear}
                                disabled={loading}
                                title="Clear Form (Esc)"
                            >
                                Clear
                            </button>
                    </div>
                </div>
            </div>

            {loading && (
                <div className="row">
                    <div className="col-md-8 offset-md-2">
                        <LoadingSkeleton variant="card" />
                    </div>
                </div>
            )}

            {error && (
                <div className="alert alert-danger" role="alert">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {quote && !loading && (
                <div className="row">
                    <div className="col-md-8 offset-md-2">
                        <div className="card">
                            <div className="card-header bg-light">
                                <h5 className="mb-0">Exchange Rate Quote</h5>
                                <small className="text-muted">Effective Date: {quote.effectiveDate}</small>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-4 text-center border-right">
                                        <h6 className="text-muted mb-1">NBP Official Rate</h6>
                                        <div className="h4 mb-0 text-primary">
                                            {formatRate(quote.nbpMid)} PLN
                                        </div>
                                    </div>
                                    <div className="col-md-4 text-center border-right">
                                        <h6 className="text-muted mb-1">Cantor {selectedSide.toUpperCase()} Price</h6>
                                        <div className="h4 mb-0 currency-rate">
                                            {formatRate(quote.price)} PLN
                                        </div>
                                    </div>
                                    <div className="col-md-4 text-center">
                                        <h6 className="text-muted mb-1">Margin</h6>
                                        <div className={`h4 mb-0 ${calculateMargin() >= 0 ? 'text-success' : 'text-danger'}`}>
                                            {calculateMargin() >= 0 ? '+' : ''}{formatRate(calculateMargin())} PLN
                                        </div>
                                    </div>
                                </div>
                                
                                <hr className="my-3"/>
                                
                                <div className="row">
                                    <div className="col-12">
                                        <div className="bg-light p-3 rounded">
                                            <h6 className="mb-2">Exchange Information:</h6>
                                            <ul className="list-unstyled mb-0 small">
                                                <li>• <strong>Currency:</strong> {selectedCurrency} ({CURRENCY_NAMES[selectedCurrency]})</li>
                                                <li>• <strong>Transaction:</strong> {selectedSide.toUpperCase()} (you {selectedSide === 'buy' ? 'buy foreign currency' : 'sell foreign currency'})</li>
                                                <li>• <strong>Rate Base:</strong> National Bank of Poland (NBP)</li>
                                                {FULL_SUPPORT_CURRENCIES.includes(selectedCurrency) && (
                                                    <li>• <strong>Available:</strong> Both BUY and SELL operations</li>
                                                )}
                                                {SELL_ONLY_CURRENCIES.includes(selectedCurrency) && (
                                                    <li>• <strong>Available:</strong> SELL operations only</li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="row mt-4">
                <div className="col-12">
                    <div className="text-center">
                        <p className="text-muted mb-0">
                            <small>
                                Live rates from National Bank of Poland • Updated for {selectedDate}
                            </small>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default CantorQuote;
