import React from 'react';
import { NavLink } from 'react-router-dom';

import { linkRoutes } from '../../data/routes';

const DesktopHomeNavigation = () => {
  const generateRoutes = () => {
    return linkRoutes.map(route => (
      <NavLink to={route.url}>
        <li>{route.text}</li>
      </NavLink>
    ));
  };
  return <>{generateRoutes()}</>;
};

export default DesktopHomeNavigation;
