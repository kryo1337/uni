import { useState, useEffect, useCallback } from 'react';
import { getRate } from '../services/api';

const useRate = (code, date = null) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchRate = useCallback(async () => {
        if (!code) {
            setData(null);
            setLoading(false);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await getRate(code, date);
            setData(result);
        } catch (err) {
            setError(err.message || 'Failed to fetch currency rate');
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [code, date]);

    const refetch = useCallback(() => {
        fetchRate();
    }, [fetchRate]);

    useEffect(() => {
        fetchRate();
    }, [fetchRate]);

    return {
        data,
        loading,
        error,
        refetch,
    };
};

export default useRate;
