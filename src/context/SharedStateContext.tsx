import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { parseShareParams, clearShareParams } from '../utils/shareUtils'

interface SharedState {
  tool: string | null;
  jsonData: string | null;
  toolSettings: Record<string, any> | null;
  hasSharedParams: boolean;
}

interface SharedStateContextProps {
  sharedState: SharedState;
  clearSharedState: () => void;
}

const initialState: SharedState = {
  tool: null,
  jsonData: null,
  toolSettings: null,
  hasSharedParams: false
};

// 创建上下文
const SharedStateContext = createContext<SharedStateContextProps>({
  sharedState: initialState,
  clearSharedState: () => {}
});

interface SharedStateProviderProps {
  children: ReactNode;
}

// 提供共享状态的Provider组件
export const SharedStateProvider: React.FC<SharedStateProviderProps> = ({ children }) => {
  const [sharedState, setSharedState] = useState<SharedState>(initialState);

  // 在组件挂载时解析URL参数
  useEffect(() => {
    const params = parseShareParams();
    const hasParams = params.tool !== null || params.jsonData !== null || params.toolSettings !== null;
    
    setSharedState({
      ...params,
      hasSharedParams: hasParams
    });
  }, []);

  // 清除共享状态和URL参数
  const clearSharedState = () => {
    setSharedState(initialState);
    clearShareParams();
  };

  return (
    <SharedStateContext.Provider value={{ sharedState, clearSharedState }}>
      {children}
    </SharedStateContext.Provider>
  );
}

// 使用共享状态的Hook
export const useSharedState = () => useContext(SharedStateContext); 