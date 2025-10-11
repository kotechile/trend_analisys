/**
 * Higher-order component for router navigation
 */
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export interface WithRouterProps {
  navigate: (path: string) => void;
  location: Location;
}

export const withRouter = <P extends object>(
  Component: React.ComponentType<P & WithRouterProps>
) => {
  const WrappedComponent = (props: P) => {
    const navigate = useNavigate();
    const location = useLocation();

    const navigateTo = (path: string) => {
      navigate(path);
    };

    return (
      <Component
        {...props}
        navigate={navigateTo}
        location={location}
      />
    );
  };

  WrappedComponent.displayName = `withRouter(${Component.displayName || Component.name})`;

  return WrappedComponent;
};
