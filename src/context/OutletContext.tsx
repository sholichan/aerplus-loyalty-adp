import React, { createContext, useContext, useState, ReactNode } from "react";

interface OutletContextType {
    selectedOutlet: string;
    setSelectedOutlet: (id: string) => void;
}

const OutletContext = createContext<OutletContextType | undefined>(undefined);

export const OutletProvider = ({ children }: { children: ReactNode }) => {
    const [selectedOutlet, setSelectedOutlet] = useState<string>("");

    return (
        <OutletContext.Provider value={{ selectedOutlet, setSelectedOutlet }}>
            {children}
        </OutletContext.Provider>
    );
};

export const useOutlet = () => {
    const context = useContext(OutletContext);
    if (!context) {
        throw new Error("useOutlet must be used within an OutletProvider");
    }
    return context;
};
