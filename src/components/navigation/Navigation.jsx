import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';

import { variables } from 'styles/variables';

import LinkNavigation from './LinkNavigation';
import ScrollNavigation from './ScrollNavigation';

const NavigationContainer = styled.nav`
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 1.5em;
  height: 3em;
  width: 100%;
  position: fixed;
  top: 0;
  background-color: ${variables.colors.navGrey};
  z-index: 1000;
  transition: transform 0.25s ease-in-out;
  ${props => (props.hidden ? 'transform: translateY(-100%);' : '')}
`;

const Navigation = () => {
  const location = useLocation();
  const [activeElement, setActiveElement] = useState('home');

  useEffect(() => {
    console.log(location);
    if (location.pathname !== '/') setActiveElement('');
  }, [location]);

  const onSetActive = activeElement => {
    setActiveElement(activeElement);
  };

  return (
    <NavigationContainer hidden={activeElement === 'home'}>
      {location.pathname !== '/' && <LinkNavigation />}
      {location.pathname === '/' && (
        <ScrollNavigation onSetActive={onSetActive} />
      )}
    </NavigationContainer>
  );
};
export default Navigation;
