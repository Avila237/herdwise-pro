import { ReactNode } from 'react';
import { useFarm, FarmContext } from '@/hooks/useFarm';

interface FarmProviderProps {
  children: ReactNode;
}

export function FarmProvider({ children }: FarmProviderProps) {
  const farmState = useFarm();

  return (
    <FarmContext.Provider value={farmState}>
      {children}
    </FarmContext.Provider>
  );
}
