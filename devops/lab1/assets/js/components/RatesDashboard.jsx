import React, { useState, useMemo, useCallback } from 'react';
import DatePicker from './DatePicker';
import { useRate, useCantorQuote } from '../hooks';

const SUPPORTED_CURRENCIES = ['EUR', 'USD', 'CZK', 'IDR', 'BRL'];

const CURRENCY_NAMES = {
    EUR: 'Euro',
    USD: 'US Dollar',
    CZK: 'Czech Koruna',
    IDR: 'Indonesian Rupiah',
    BRL: 'Brazilian Real',
};

const FULL_SUPPORT_CURRENCIES = ['EUR', 'USD'];
const SELL_ONLY_CURRENCIES = ['CZK', 'IDR', 'BRL'];

const CurrencyRow = React.memo(({ currency, selectedDate, isHighest, isLowest, lastUpdated, onRefresh }) => {
    const { data: rate, loading: rateLoading, error: rateError } = useRate(currency, selectedDate);
    const { data: buyQuote, loading: buyLoading } = useCantorQuote(
        FULL_SUPPORT_CURRENCIES.includes(currency) ? currency : null, 
        FULL_SUPPORT_CURRENCIES.includes(currency) ? 'buy' : null, 
        selectedDate
    );
    const { data: sellQuote, loading: sellLoading } = useCantorQuote(currency, 'sell', selectedDate);

    const isLoading = rateLoading || buyLoading || sellLoading;
    const hasError = rateError;

    const formatRate = (value) => value ? value.toFixed(4) : '—';

    const getCellClass = (isAvailable) => {
        if (hasError) return 'text-danger';
        if (!isAvailable) return 'text-muted';
        return 'text-success';
    };

    const getRowClass = () => {
        let classes = '';
        if (isHighest) classes += 'table-success ';
        if (isLowest) classes += 'table-warning ';
        return classes.trim();
    };

    return (
        <tr className={getRowClass()}>
            <td>
                <div className="d-flex align-items-center">
                    <strong 
                        className="currency-code me-4" 
                        title={CURRENCY_NAMES[currency]}
                        style={{ cursor: 'help' }}
                    >
                        {currency}
                    </strong>
                    <small className="text-muted d-none d-md-inline">
                        {CURRENCY_NAMES[currency]}
                    </small>
                    {isHighest && <span className="badge bg-success ms-2 d-none d-lg-inline">Highest</span>}
                    {isLowest && <span className="badge bg-warning ms-2 d-none d-lg-inline">Lowest</span>}
                </div>
            </td>
            <td className="text-center">
                {isLoading ? (
                    <span className="text-primary loading-dots">Loading</span>
                ) : hasError ? (
                    <span className="text-danger">Error</span>
                ) : (
                    <strong className="text-primary">{formatRate(rate?.mid)}</strong>
                )}
            </td>
            <td className={`text-center ${getCellClass(FULL_SUPPORT_CURRENCIES.includes(currency))}`}>
                {FULL_SUPPORT_CURRENCIES.includes(currency) ? (
                    isLoading ? (
                        <span className="text-success loading-dots">Loading</span>
                    ) : (
                        <strong>{formatRate(buyQuote?.price)}</strong>
                    )
                ) : (
                    <span title="BUY not available for this currency">N/A</span>
                )}
            </td>
            <td className={`text-center ${getCellClass(true)}`}>
                {isLoading ? (
                    <span className="text-success loading-dots">Loading</span>
                ) : (
                    <strong>{formatRate(sellQuote?.price)}</strong>
                )}
            </td>
                            <td className="text-center">
                <button
                    className="btn btn-outline-primary btn-sm px-3 py-2"
                    onClick={() => onRefresh(currency)}
                    disabled={isLoading}
                    title="Refresh rates"
                >
                    Refresh
                </button>
            </td>
        </tr>
    );
});

const RatesDashboard = React.memo(() => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [refreshKeys, setRefreshKeys] = useState({});

    const ratesData = {};
    SUPPORTED_CURRENCIES.forEach(currency => {
        const { data } = useRate(currency, selectedDate);
        ratesData[currency] = data;
    });

    const sortedCurrencies = useMemo(() => {
        const currencies = [...SUPPORTED_CURRENCIES];
        
        if (sortBy === 'name') {
            currencies.sort((a, b) => {
                const comparison = CURRENCY_NAMES[a].localeCompare(CURRENCY_NAMES[b]);
                return sortOrder === 'asc' ? comparison : -comparison;
            });
        } else if (sortBy === 'rate') {
            currencies.sort((a, b) => {
                const rateA = ratesData[a]?.mid || 0;
                const rateB = ratesData[b]?.mid || 0;
                return sortOrder === 'asc' ? rateA - rateB : rateB - rateA;
            });
        }
        
        return currencies;
    }, [sortBy, sortOrder, ratesData]);

    const { highest, lowest } = useMemo(() => {
        const validRates = SUPPORTED_CURRENCIES
            .map(currency => ({ currency, rate: ratesData[currency]?.mid || 0 }))
            .filter(item => item.rate > 0);
        
        if (validRates.length === 0) return { highest: null, lowest: null };
        
        const highest = validRates.reduce((max, current) => 
            current.rate > max.rate ? current : max
        );
        const lowest = validRates.reduce((min, current) => 
            current.rate < min.rate ? current : min
        );
        
        return { 
            highest: highest.currency, 
            lowest: lowest.currency 
        };
    }, [ratesData]);

    const handleDateChange = useCallback((date) => {
        setSelectedDate(date);
        setLastUpdated(new Date());
    }, []);

    const handleSort = useCallback((column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    }, [sortBy, sortOrder]);

    const handleRefreshAll = useCallback(() => {
        setRefreshKeys(prev => {
            const newKeys = {};
            SUPPORTED_CURRENCIES.forEach(currency => {
                newKeys[currency] = (prev[currency] || 0) + 1;
            });
            return newKeys;
        });
        setLastUpdated(new Date());
    }, []);

    const handleRefreshCurrency = useCallback((currency) => {
        setRefreshKeys(prev => ({
            ...prev,
            [currency]: (prev[currency] || 0) + 1
        }));
        setLastUpdated(new Date());
    }, []);

    const getSortIcon = useCallback((column) => {
        if (sortBy !== column) return '↕';
        return sortOrder === 'asc' ? '↑' : '↓';
    }, [sortBy, sortOrder]);

    return (
        <div className="dashboard-container">
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h1 className="dashboard-title mb-2">NBP Currency Exchange</h1>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                            <div className="badge bg-success px-3 py-2">
                                Last updated: {lastUpdated.toLocaleTimeString()}
                            </div>
                            <button
                                className="btn btn-primary px-4 py-2"
                                onClick={handleRefreshAll}
                                title="Refresh all rates"
                            >
                                Refresh All
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="row mb-5">
                <div className="col-md-6 offset-md-3">
                    <div className="date-picker-container">
                        <DatePicker
                            value={selectedDate}
                            onChange={handleDateChange}
                            label="Select Date"
                        />
                    </div>
                </div>
            </div>

            <div className="card currency-card shadow-lg">
                <div className="card-header">
                    <div className="row align-items-center">
                        <div className="col">
                            <h5 className="mb-0">Exchange Rates & Cantor Prices</h5>
                        </div>
                        <div className="col-auto">
                            <div className="d-flex gap-3">
                                <span className="badge bg-success px-3 py-2">Available</span>
                                <span className="badge bg-secondary px-3 py-2">Not Available</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover table-striped mb-0">
                            <thead className="table-dark">
                                <tr>
                                    <th 
                                        className="sortable-header"
                                        onClick={() => handleSort('name')}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        Currency {getSortIcon('name')}
                                    </th>
                                    <th 
                                        className="text-center sortable-header"
                                        onClick={() => handleSort('rate')}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        NBP Official Rate {getSortIcon('rate')}
                                    </th>
                                    <th className="text-center text-success">
                                        Cantor BUY Price
                                    </th>
                                    <th className="text-center text-success">
                                        Cantor SELL Price
                                    </th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedCurrencies.map((currency) => (
                                    <CurrencyRow
                                        key={`${currency}-${refreshKeys[currency] || 0}`}
                                        currency={currency}
                                        selectedDate={selectedDate}
                                        isHighest={currency === highest}
                                        isLowest={currency === lowest}
                                        lastUpdated={lastUpdated}
                                        onRefresh={handleRefreshCurrency}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <div className="row mt-3">
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

export default RatesDashboard;