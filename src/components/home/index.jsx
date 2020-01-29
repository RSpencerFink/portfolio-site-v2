import React from 'react';
import styled from 'styled-components';
import { variables } from '../../styles/variables';
import { Link, Element } from 'react-scroll';

import Background from './background';

const HomeContainer = styled.div`
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #fff;
  a {
    z-index: 10;
    margin-top: 6em;
  }
  .canvas {
    max-width: 100%;
    overflow-x: hidden;
    z-index: 0;
    position: absolute;
    top: 0;
    left: 0;
    background: ${variables.colors.darkGrey};
  }
`;

const HomeLogo = styled.img`
  z-index: 10;
  width: 25%;
`;

const ContinueButton = styled.button`
    z-index: 10;
    width: 240px;
    height: 64px;
    background: ${variables.colors.darkGrey}b0;
    border 1px solid #fff;
    color: #fff;
    cursor: pointer;
    &:hover{
        background-color: ${variables.colors.hoverGrey}b0;
    }
`;

const Home = () => {
  return (
    <Element name="home">
      <HomeContainer>
        <HomeLogo src="/images/icons/rsf-white.png" alt="rsf logo" />
        <Link to="about" spy={true} smooth={true} duration={500}>
          <ContinueButton>Continue</ContinueButton>
        </Link>
        <Background />
      </HomeContainer>
    </Element>
  );
};

export default Home;
