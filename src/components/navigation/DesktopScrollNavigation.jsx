import React from 'react';
import { Link } from 'react-scroll';

import { scrollRoutes } from '../../data/routes';

const DesktopHomeNavigation = ({ onSetActive }) => {
  const generateRoutes = () => {
    return scrollRoutes.map(route => (
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

export default DesktopHomeNavigation;
