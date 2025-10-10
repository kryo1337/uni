import { useState, useEffect, useCallback } from 'react';
import { getCantorQuote } from '../services/api';

const useCantorQuote = (code, side, date = null) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchQuote = useCallback(async () => {
        if (!code || !side) {
            setData(null);
            setLoading(false);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await getCantorQuote(code, side, date);
            setData(result);
        } catch (err) {
            setError(err.message || 'Failed to fetch cantor quote');
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [code, side, date]);

    const refetch = useCallback(() => {
        fetchQuote();
    }, [fetchQuote]);

    useEffect(() => {
        fetchQuote();
    }, [fetchQuote]);

    return {
        data,
        loading,
        error,
        refetch,
    };
};

export default useCantorQuote;
