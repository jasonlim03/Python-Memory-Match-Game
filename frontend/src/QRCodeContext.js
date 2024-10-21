// QRCodeContext.js
import React, { createContext, useContext, useState } from 'react';

const QRCodeContext = createContext();

export const QRCodeProvider = ({ children }) => {
    const [isValidScan, setIsValidScan] = useState(false);

    return (
        <QRCodeContext.Provider value={{ isValidScan, setIsValidScan }}>
            {children}
        </QRCodeContext.Provider>
    );
};

export const useQRCode = () => {
    return useContext(QRCodeContext);
};
