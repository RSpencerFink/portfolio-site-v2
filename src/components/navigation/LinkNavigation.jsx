import React from 'react';
import { Link } from 'react-router-dom';

import logo from 'assets/images/icons/rsf-white.svg';

import DesktopLinkNavigation from './DesktopLinkNavigation';
import { Left, Right } from './styles';

const LinkNavigation = () => {
  return (
    <>
      <Left>
        <Link to="/">
          <img src={logo} alt="rsf logo" />
        </Link>
      </Left>
      <Right>
        <DesktopLinkNavigation />
      </Right>
    </>
  );
};
export default LinkNavigation;
