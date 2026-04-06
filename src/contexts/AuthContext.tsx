import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useToast, toast } from '@/hooks/use-toast';

interface AuthContextType {
    user: any | null;
    token: string | null;
    hierarchyData: any[] | null;
    sendOtp: (mailId: string) => Promise<boolean>;
    verifyOtp: (mailId: string, otp: string) => Promise<boolean>;
    logout: () => void;
    isAuthenticated: boolean;
    isInitialLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any | null>(() => {
        try {
            const savedUser = sessionStorage.getItem('user_data');
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (e) {
            return null;
        }
    });
    const [token, setToken] = useState<string | null>(sessionStorage.getItem('access_token'));
    const [hierarchyData, setHierarchyData] = useState<any[] | null>(() => {
        try {
            const savedHierarchy = sessionStorage.getItem('hierarchy_data');
            return savedHierarchy ? JSON.parse(savedHierarchy) : null;
        } catch (e) {
            return null;
        }
    });
    // Remove useToast hook as we will use the direct toast import to stabilize dependencies
    // const { toast } = useToast();

    const [isInitialLoading, setIsInitialLoading] = useState<boolean>(!!token && !user);

    // Refs to prevent redundant/concurrent API calls
    const isFetchingUser = useRef(false);
    const isFetchingHierarchy = useRef(false);

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        setHierarchyData(null);
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('user_data');
        sessionStorage.removeItem('hierarchy_data');
        toast({
            title: "Logged Out",
            description: "You have been successfully logged out.",
        });
    }, []); // toast is now a stable top-level import

    const fetchUserData = useCallback(async (tokenToUse: string) => {
        if (isFetchingUser.current) return;
        isFetchingUser.current = true;

        try {
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
            const apiUrl = `${API_BASE_URL}/api/method/rms.apuser.get_user_data`;

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'token': tokenToUse
                }
            });

            if (!response.ok) {
                const errorText = await response.text().catch(() => "Unknown error");
                console.error(`Fetch user data failed with status ${response.status}: ${errorText}`);
                if (response.status === 401 || response.status === 403) {
                    logout();
                }
                return;
            }

            const data = await response.json();

            if (data.message && data.message.user_code) {
                setUser(data.message);
                sessionStorage.setItem('user_data', JSON.stringify(data.message));
            } else {
                console.warn('User data response did not contain user_code', data);
                const errorMessage = data.message?.message || "";
                if (errorMessage.includes("Token has been revoked") || errorMessage.includes("Invalid token")) {
                    logout();
                }
            }
        } catch (error) {
            console.error('Fetch user data error:', error);
        } finally {
            isFetchingUser.current = false;
        }
    }, [logout]);

    const fetchHierarchyData = useCallback(async (tokenToUse: string) => {
        // Don't fetch if already in progress or if we already have it in state
        if (isFetchingHierarchy.current || hierarchyData) return;
        isFetchingHierarchy.current = true;

        try {
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
            const apiUrl = `${API_BASE_URL}/api/method/rms.branch.heirarchy`;

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'token': tokenToUse
                }
            });

            if (!response.ok) {
                const errorText = await response.text().catch(() => "Unknown error");
                console.error(`Fetch hierarchy data failed with status ${response.status}: ${errorText}`);
                if (response.status === 401 || response.status === 403) {
                    logout();
                }
                return;
            }

            const data = await response.json();

            if (data.message) {
                setHierarchyData(data.message);
                sessionStorage.setItem('hierarchy_data', JSON.stringify(data.message));
                console.log(`Hierarchy data loaded: ${data.message.length} records`);
            } else {
                console.warn('Hierarchy data response did not contain message', data);
            }
        } catch (error) {
            console.error('Fetch hierarchy data error:', error);
        } finally {
            isFetchingHierarchy.current = false;
        }
    }, [hierarchyData]); // Depend on hierarchyData to correctly skip if it exists

    const sendOtp = async (mailId: string) => {
        try {
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
            const apiUrl = `${API_BASE_URL}/api/method/rms.apuser.login_with_otp`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ mail_id: mailId })
            });

            const data = await response.json();

            if (data.message && data.message.status === 'success') {
                toast({
                    title: "OTP Sent",
                    description: data.message.message || "Please check your email for the OTP.",
                    duration: 3000,
                });
                return true;
            } else {
                const errorMessage = data.message?.message || "Failed to send OTP";
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: errorMessage,
                });
                return false;
            }
        } catch (error) {
            console.error('Send OTP error:', error);
            toast({
                variant: "destructive",
                title: "Network Error",
                description: "Failed to connect to the server. Please try again later.",
            });
            return false;
        }
    };

    const verifyOtp = async (mailId: string, otp: string) => {
        try {
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
            const apiUrl = `${API_BASE_URL}/api/method/rms.apuser.login_with_otp`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ mail_id: mailId, otp })
            });

            const data = await response.json();

            if (data.message && data.message.status === 'success' && data.message.access_token) {
                const accessToken = data.message.access_token;
                setToken(accessToken);
                sessionStorage.setItem('access_token', accessToken);

                // Fetch full user data after successful login
                await fetchUserData(accessToken);
                await fetchHierarchyData(accessToken);

                toast({
                    title: "Login Successful",
                    description: "Welcome back!",
                    duration: 3000,
                });
                return true;
            } else {
                const errorMessage = data.message?.message || "Invalid OTP";
                toast({
                    variant: "destructive",
                    title: "Login Error",
                    description: errorMessage,
                });
                return false;
            }
        } catch (error) {
            console.error('Verify OTP error:', error);
            toast({
                variant: "destructive",
                title: "Network Error",
                description: "Failed to connect to the server. Please try again later.",
            });
            return false;
        }
    };

    useEffect(() => {
        const loadInitialData = async () => {
            if (token) {
                const promises = [];
                if (!user && !isFetchingUser.current) {
                    promises.push(fetchUserData(token));
                }
                if (!hierarchyData && !isFetchingHierarchy.current) {
                    promises.push(fetchHierarchyData(token));
                }
                if (promises.length > 0) {
                    await Promise.all(promises);
                }
            }
            setIsInitialLoading(false);
        };

        if (token) {
            loadInitialData();
        } else {
            setIsInitialLoading(false);
        }
    }, [token, user, hierarchyData, fetchUserData, fetchHierarchyData]);

    const isAuthenticated = !!token;

    return (
        <AuthContext.Provider value={{ user, token, hierarchyData, sendOtp, verifyOtp, logout, isAuthenticated, isInitialLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
