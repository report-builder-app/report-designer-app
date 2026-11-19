import React, { createContext, useCallback, useMemo, useState } from 'react';

export const NavigationContext = createContext(null);

export function NavigationProvider({ children, initialTab = 'designer' }) {
    const [activeTab, setActiveTab] = useState(initialTab);

    const goTo = useCallback((tab) => setActiveTab(tab), []);

    const value = useMemo(
        () => ({ activeTab, setActiveTab, goTo }),
        [activeTab, goTo]
    );

    return (
        <NavigationContext.Provider value={value}>
            {children}
        </NavigationContext.Provider>
    );
}