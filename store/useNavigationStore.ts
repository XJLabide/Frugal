import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NavigationState {
    // Desktop sidebar state
    sidebarCollapsed: boolean;
    setSidebarCollapsed: (collapsed: boolean) => void;
    toggleSidebar: () => void;

    // Mobile menu state
    mobileMenuOpen: boolean;
    setMobileMenuOpen: (open: boolean) => void;
    toggleMobileMenu: () => void;
    closeMobileMenu: () => void;
}

export const useNavigationStore = create<NavigationState>()(
    persist(
        (set) => ({
            // Desktop sidebar
            sidebarCollapsed: false,
            setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
            toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

            // Mobile menu (not persisted, always starts closed)
            mobileMenuOpen: false,
            setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
            toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
            closeMobileMenu: () => set({ mobileMenuOpen: false }),
        }),
        {
            name: 'frugal-navigation',
            // Only persist sidebar state, not mobile menu state
            partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
        }
    )
);
