import React from 'react';
import { Link } from 'react-scroll';

import { routes } from '../../data/routes';

const DesktopNavigation = ({ onSetActive }) => {
  const generateRoutes = () => {
    return routes.map(route => (
      <Link
        to={route}
        spy
        hashSpy
        smooth
        duration={500}
        onSetActive={e => onSetActive(e)}
      >
        <li>{route}</li>
      </Link>
    ));
  };
  return <>{generateRoutes()}</>;
};

export default DesktopNavigation;
