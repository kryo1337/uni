import React, { useState } from 'react';
import CurrencySelect from './CurrencySelect';
import DatePicker from './DatePicker';
import { useHistory } from '../hooks';

const RateDetails = () => {
    const [selectedCurrency, setSelectedCurrency] = useState('EUR');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    
    const { data: historyData, loading, error, refetch } = useHistory(selectedCurrency, selectedDate);

    const handleCurrencyChange = (currency) => {
        setSelectedCurrency(currency);
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatRate = (rate) => {
        return rate ? rate.toFixed(4) : '—';
    };

    return (
        <div className="dashboard-container">
            <h1 className="text-center dashboard-title">Historical Exchange Rates</h1>
            
            <div className="row mb-5">
                <div className="col-md-6 mb-3">
                    <div className="date-picker-container">
                        <CurrencySelect
                            value={selectedCurrency}
                            onChange={handleCurrencyChange}
                            label="Select Currency"
                        />
                    </div>
                </div>
                <div className="col-md-6 mb-3">
                    <div className="date-picker-container">
                        <DatePicker
                            value={selectedDate}
                            onChange={handleDateChange}
                            label="End Date (last 14 business days)"
                        />
                    </div>
                </div>
            </div>

            <div className="row mb-4">
                <div className="col-12 d-flex justify-content-between align-items-center">
                    <div>
                        <h4 className="mb-1">
                            {selectedCurrency} Exchange Rate History
                        </h4>
                        {historyData && (
                            <small className="text-muted">
                                ({historyData.start} to {historyData.end})
                            </small>
                        )}
                    </div>
                    <button
                        className="btn btn-outline-primary px-4 py-2"
                        onClick={refetch}
                        disabled={loading}
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {loading && (
                <div className="text-center py-5">
                    <h5 className="text-primary loading-dots">Loading historical data</h5>
                </div>
            )}

            {error && (
                <div className="alert alert-danger" role="alert">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {historyData && !loading && (
                <div className="card">
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover table-striped mb-0">
                                <thead className="table-dark">
                                    <tr>
                                        <th scope="col">Date</th>
                                        <th scope="col" className="text-end">NBP Rate (PLN)</th>
                                        <th scope="col" className="text-center">Change</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historyData.items && historyData.items.length > 0 ? (
                                        historyData.items.slice().reverse().map((item, index, reversedArray) => {
                                            const prevRate = index > 0 ? reversedArray[index - 1].mid : null;
                                            const change = prevRate ? item.mid - prevRate : 0;
                                            const changePercent = prevRate ? ((change / prevRate) * 100).toFixed(2) : 0;
                                            
                                            return (
                                                <tr key={item.effectiveDate}>
                                                    <td>
                                                        <strong className="text-primary">{formatDate(item.effectiveDate)}</strong>
                                                    </td>
                                                    <td className="text-end">
                                                        <span className="h6 mb-0 text-success">
                                                            {formatRate(item.mid)} PLN
                                                        </span>
                                                    </td>
                                                    <td className="text-center">
                                                        {index > 0 && (
                                                            <span className={`badge ${change >= 0 ? 'bg-success' : 'bg-danger'}`}>
                                                                {change >= 0 ? '+' : ''}{changePercent}%
                                                            </span>
                                                        )}
                                                        {index === 0 && (
                                                            <span className="text-muted">—</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="text-center py-4 text-muted">
                                                No historical data available for this period
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {historyData && historyData.items && historyData.items.length > 0 && (
                <div className="row mt-4">
                    <div className="col-12">
                        <div className="bg-light p-3 rounded text-center">
                            <p className="text-muted mb-2">
                                <small>
                                    <strong>Showing {historyData.items.length} rates</strong> from last 14 business days • 
                                    Data from National Bank of Poland
                                </small>
                            </p>
                            <p className="text-info mb-0">
                                <small>
                                    NBP doesn't publish rates on weekends and holidays. 
                                </small>
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RateDetails;
