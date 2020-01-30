import React from 'react';
import styled from 'styled-components';

import logo from '../../assets/images/icons/rsf-white.png';

import { Gradient } from '../shared';
import { variables } from '../../styles/variables';

const FooterContainer = styled.footer`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: calc(6em + 30vh);
  background-color: #0e0e0e;
  position: relative;
`;

const Logo = styled.img`
  margin-top: 6em;
  width: 5%;
`;

const SocialMediaRow = styled.ul`
  margin-top: 3em;
  display: flex;
  list-style: none;
  width: 30%;
  justify-content: center;
  font-size: 1.25em;
  padding: 0;
  li {
    margin: 0 2em;
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
      <Gradient to="#0e0e0e" from={variables.colors.darkerGrey} />
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
