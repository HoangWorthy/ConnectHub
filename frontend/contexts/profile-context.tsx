"use client"

import { Profile } from "@/interfaces/Profile"
import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "./auth-context"
import { getCurrentProfile } from "@/services/ProfileService"

interface ProfileContextType {
    profile: Profile | null
    isLoading: boolean
    refreshProfile: () => Promise<void>
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)
export function ProfileProvider({ children }: { children: React.ReactNode }) {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { loggedIn } = useAuth();

    const fetchCurrentProfile = async () => {
        setIsLoading(true);
        try {
            const response = await getCurrentProfile();
            setProfile(response);
            localStorage.setItem("profile", JSON.stringify(response));
        } catch (error) {
            console.error("Failed to fetch profile:", error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (loggedIn) {
            const savedProfile = localStorage.getItem("profile")
            if (savedProfile) {
                setProfile(JSON.parse(savedProfile));
            } else {
                fetchCurrentProfile();
            }
        } else {
            setProfile(null);
            localStorage.removeItem("profile");
            setIsLoading(false);
        }
    }, [loggedIn]);

    return (
        <ProfileContext.Provider value={{
            profile,
            isLoading,
            refreshProfile: fetchCurrentProfile,
        }}>
            {children}
        </ProfileContext.Provider>
    )
}

export function useProfile() {
    const context = useContext(ProfileContext)
    if (context === undefined) {
        throw new Error("useProfile must be used within a ProfileProvider")
    }
    return context
}