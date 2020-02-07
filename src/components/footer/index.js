import React from 'react';
import styled from 'styled-components';

import logo from '../../assets/images/icons/rsf-white.svg';

import { Divider } from '../shared';
import { variables } from '../../styles/variables';
import { mediaMin } from '../../styles/mediaQueries';

const FooterContainer = styled.footer`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: calc(30vh);
  background-color: ${variables.colors.darkGrey};
  position: relative;
`;

const Logo = styled.img`
  width: 25%;
  ${mediaMin.tablet`
    width: 10%;
  `}
  ${mediaMin.tabletLandscape`
    width: 5%;
  `}
`;

const SocialMediaRow = styled.ul`
  margin-top: 3em;
  display: flex;
  list-style: none;
  justify-content: center;
  font-size: 1em;
  ${mediaMin.tabletLandscape`
    font-size: 1.25em;
    width: 30%;
  `}
  padding: 0;
  li {
    margin: 0 0.5em;
    ${mediaMin.tabletLandscape`
    margin: 0 2em;
    `}
    &:first-child {
      margin-left: 0;
    }
    &:last-child {
      margin-right: 0;
    }
  }
`;

const Footer = () => {
  return (
    <FooterContainer>
      <Divider />
      <Logo src={logo} alt="RSF" />
      <SocialMediaRow>
        <li>
          <a
            className="underline"
            href="https://www.linkedin.com/in/r-spencer-fink/"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
        </li>
        <li>
          <a
            className="underline"
            href="https://github.com/RSpencerFink"
            target="_blank"
            rel="noopener noreferrer"
          >
            Github
          </a>
        </li>
        <li>
          <a
            className="underline"
            href="https://www.instagram.com/rspencerfink/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>
        </li>
      </SocialMediaRow>
    </FooterContainer>
  );
};

export default Footer;
