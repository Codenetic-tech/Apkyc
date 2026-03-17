import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface KycItem {
    application_id: string | null;
    user_name: string | null;
    kyc_stage: string | null;
    refer: string | null;
    application_created_date: string | null;
    application_modified_date_time: string | null;
    application_status: string | null;
    src: string | null;
    tag: string | null;
    ucc: string | null;
    nse: string | null;
    bse: string | null;
    nfo: string | null;
    bfo: string | null;
    mcx: string | null;
    client_mapping: boolean | null;
}

export interface KycStatusCount {
    'IN PROGRESS': number;
    'PENDING FOR APPROVAL': number;
    'REJECTED': number;
    'APPROVED': number;
    'ACCOUNT OPENED': number;
}

interface KycDataResponse {
    message: {
        count: number;
        status_count: KycStatusCount;
        data: KycItem[];
    };
}

interface FetchKycParams {
    limit_start?: number;
    limit_page_length?: number;
    from_application_modified_date_time?: string;
    to_application_modified_date_time?: string;
    application_id?: string;
    ucc_field?: string;
    application_status?: string;
}

interface KycContextType {
    kycData: KycItem[] | null;
    isLoading: boolean;
    error: string | null;
    count: number;
    statusCount: KycStatusCount;
    fetchKycData: (params?: FetchKycParams, silent?: boolean) => Promise<void>;
    refreshKycData: (params?: FetchKycParams) => Promise<void>;
    clearKycData: () => void;
}

const KycContext = createContext<KycContextType | undefined>(undefined);

export const useKyc = () => {
    const context = useContext(KycContext);
    if (context === undefined) {
        throw new Error('useKyc must be used within a KycProvider');
    }
    return context;
};

export const KycProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { token, isAuthenticated } = useAuth();
    const [kycData, setKycData] = useState<KycItem[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [count, setCount] = useState(0);
    const [statusCount, setStatusCount] = useState<KycStatusCount>({
        'IN PROGRESS': 0,
        'PENDING FOR APPROVAL': 0,
        'REJECTED': 0,
        'APPROVED': 0,
        'ACCOUNT OPENED': 0,
    });
    const isFetching = React.useRef(false);

    const fetchKycData = useCallback(async (params: FetchKycParams = {}, silent: boolean = false) => {
        if (!token || isFetching.current) return;
        isFetching.current = true;
        if (!silent) setIsLoading(true);

        setError(null);
        try {
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
            const apiUrl = `${API_BASE_URL}/api/method/rms.apuser.apkycdata`;

            // Default payload for pagination
            const payload: any = {
                limit_start: params.limit_start || 0,
                limit_page_length: params.limit_page_length || 20
            };

            // Add optional filters
            if (params.from_application_modified_date_time) payload.from_application_modified_date_time = params.from_application_modified_date_time;
            if (params.to_application_modified_date_time) payload.to_application_modified_date_time = params.to_application_modified_date_time;
            if (params.application_id) payload.application_id = params.application_id;
            if (params.ucc_field) payload.ucc_field = params.ucc_field;
            if (params.application_status) payload.application_status = params.application_status;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'token': token
                },
                body: JSON.stringify(payload)
            });

            if (response.status !== 200) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.exception || errorData.message || response.statusText;

                if (errorMessage.includes("No KYC Data found")) {
                    setKycData([]);
                    setCount(0);
                    setError(null);
                    return;
                }
                throw new Error(`Failed to fetch KYC data: ${errorMessage}`);
            }

            const result: KycDataResponse = await response.json();

            if (result.message && result.message.data) {
                setKycData(result.message.data);
                setCount(result.message.count || 0);
                if (result.message.status_count) {
                    setStatusCount(result.message.status_count);
                }
            } else {
                setKycData([]);
                setCount(0);
            }
        } catch (err: any) {
            console.error('Error fetching KYC data:', err);
            setError(err.message || 'An error occurred while fetching KYC data.');
            setKycData(null);
            setCount(0);
        } finally {
            setIsLoading(false);
            isFetching.current = false;
        }
    }, [token]);

    const clearKycData = useCallback(() => {
        setKycData(null);
        setError(null);
        setCount(0);
    }, []);

    // Initial fetch on mount/auth
    useEffect(() => {
        if (isAuthenticated && token && kycData === null && !isLoading && !error) {
            fetchKycData();
        }
    }, [isAuthenticated, token, fetchKycData, kycData, isLoading, error]);

    // Clear data on logout
    useEffect(() => {
        if (!isAuthenticated) {
            clearKycData();
        }
    }, [isAuthenticated, clearKycData]);

    const refreshKycData = useCallback(async (params?: FetchKycParams) => {
        await fetchKycData(params || {}, true);
    }, [fetchKycData]);


    return (
        <KycContext.Provider value={{
            kycData,
            isLoading,
            error,
            count,
            statusCount,
            fetchKycData,
            refreshKycData,
            clearKycData
        }}>
            {children}
        </KycContext.Provider>
    );

};
