import { Outlet } from 'react-router-dom';
import { AnalyticsTracker } from './components/AnalyticsTracker';
import { SEO } from './components/SEO';

export function App() {
  return (
    <>
      <SEO 
        title="JSONGeeks - Developer Tools for JSON Processing"
        description="Professional JSON utilities built by developers for developers. Format, validate, compare, convert, query, and visualize JSON data with ease."
        keywords={['JSON', 'JSON formatter', 'JSON validator', 'JSON comparison', 'JSON converter', 'JSON visualization', 'developer tools']}
      />
      <AnalyticsTracker />
      <Outlet />
    </>
  );
} 