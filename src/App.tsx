import { Outlet } from 'react-router-dom';
import { AnalyticsTracker } from './components/AnalyticsTracker';

export function App() {
  return (
    <>
      <AnalyticsTracker />
      <Outlet />
    </>
  );
} 