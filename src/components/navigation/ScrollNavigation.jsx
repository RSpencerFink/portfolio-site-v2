import React from 'react';
import { Link } from 'react-scroll';

import logo from 'assets/images/icons/rsf-white.svg';

import DesktopScrollNavigation from './DesktopScrollNavigation';
import { Left, Right } from './styles';

const ScrollNavigation = ({ onSetActive }) => {
  return (
    <>
      <Left>
        <Link
          to="home"
          spy
          smooth
          duration={500}
          onSetActive={e => onSetActive(e)}
        >
          <img src={logo} alt="rsf logo" />
        </Link>
      </Left>
      <Right>
        <DesktopScrollNavigation onSetActive={onSetActive} />
      </Right>
    </>
  );
};
export default ScrollNavigation;
