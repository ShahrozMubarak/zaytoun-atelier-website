import React, { createContext, useContext, useState, useEffect } from 'react';

export const CURRENCIES = {
  PKR: { code: 'PKR', symbol: 'Rs.', rate: 1, label: 'PKR (Rs.)' },
  USD: { code: 'USD', symbol: '$', rate: 0.0036, label: 'USD ($)' },
  EUR: { code: 'EUR', symbol: '€', rate: 0.0033, label: 'EUR (€)' },
  AED: { code: 'AED', symbol: 'AED', rate: 0.0132, label: 'AED' }
};

const CurrencyContext = createContext({
  currency: 'PKR',
  setCurrency: () => {},
  formatPrice: (pkrAmount) => `Rs. ${Number(pkrAmount || 0).toLocaleString()}`,
  currencies: CURRENCIES
});

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(() => {
    try {
      const saved = localStorage.getItem('zaytoun_currency');
      return saved && CURRENCIES[saved] ? saved : 'PKR';
    } catch {
      return 'PKR';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('zaytoun_currency', currency);
    } catch (e) {
      console.warn("Currency storage error:", e);
    }
  }, [currency]);

  const formatPrice = (pkrAmount) => {
    const num = Number(pkrAmount) || 0;
    const curr = CURRENCIES[currency] || CURRENCIES.PKR;
    if (currency === 'PKR') {
      return `Rs. ${num.toLocaleString()}`;
    }
    const converted = Math.round(num * curr.rate);
    if (currency === 'USD') return `$${converted.toLocaleString()}`;
    if (currency === 'EUR') return `€${converted.toLocaleString()}`;
    if (currency === 'AED') return `${converted.toLocaleString()} AED`;
    return `${curr.symbol} ${converted.toLocaleString()}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, currencies: CURRENCIES }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    return {
      currency: 'PKR',
      setCurrency: () => {},
      formatPrice: (pkrAmount) => `Rs. ${Number(pkrAmount || 0).toLocaleString()}`,
      currencies: CURRENCIES
    };
  }
  return context;
}
