import { useState, useEffect, useCallback } from 'react';
import { getHistory } from '../services/api';

const useHistory = (code, date = null) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchHistory = useCallback(async () => {
        if (!code) {
            setData(null);
            setLoading(false);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await getHistory(code, date);
            setData(result);
        } catch (err) {
            setError(err.message || 'Failed to fetch currency history');
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [code, date]);

    const refetch = useCallback(() => {
        fetchHistory();
    }, [fetchHistory]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return {
        data,
        loading,
        error,
        refetch,
    };
};

export default useHistory;
