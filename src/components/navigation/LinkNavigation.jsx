import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

import logo from '../../assets/images/icons/rsf-white.svg';

import DesktopLinkNavigation from './DesktopLinkNavigation';

const Left = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
  padding: 0.5em 0;
  a {
    cursor: pointer;
    height: 100%;
    img {
      max-height: 100%;
      height: 100%;
    }
  }
`;

const Right = styled.ul`
  display: flex;
  flex-direction: row;
  list-style: none;
  a {
    cursor: pointer;
    margin-left: 1em;
    color: #fff;
    text-transform: uppercase;
    opacity: 0.5;
    &.active {
      opacity: 1;
    }
    &:hover {
      text-decoration: none;
    }
  }
`;

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
