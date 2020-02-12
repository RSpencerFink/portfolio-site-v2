import React from 'react';
import styled from 'styled-components';
import { Link, Element } from 'react-scroll';

import { variables } from 'styles/variables';
import { mediaMin } from 'styles/mediaQueries';

import Background from './background';
import { Logo } from 'components/shared';

const HomeContainer = styled.div`
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #fff;
  a {
    z-index: 10;
    position: absolute;
    bottom: 10%;
    ${mediaMin.tabletLandscape`
      bottom: initial;
        margin-top: 6em;
        position: relative;
    `}
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

const ContinueButton = styled.button`
    z-index: 10;
    width: 240px;
    height: 64px;
    background: ${variables.colors.darkGrey}b0;
    border 1px solid #fff;
    color: #fff;
    cursor: pointer;
    font-size: 1em;
    font-weight: 600;
    &:hover{
        background-color: ${variables.colors.hoverGrey};
        box-shadow: 0px 0px 5px 1px #ffffff40;
    }

`;

const Landing = () => {
  return (
    <Element name="home">
      <HomeContainer className="container">
        <Logo />
        <Link to="about" spy={true} smooth={true} duration={500}>
          <ContinueButton>CONTINUE</ContinueButton>
        </Link>
        <Background />
      </HomeContainer>
    </Element>
  );
};

export default Landing;
