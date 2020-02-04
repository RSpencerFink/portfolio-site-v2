import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-scroll';

import logo from '../../assets/images/icons/rsf-white.svg';

import DesktopScrollNavigation from './DesktopScrollNavigation';

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
