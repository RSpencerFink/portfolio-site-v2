import React, { useState } from 'react';
import styled from 'styled-components';
import { Element } from 'react-scroll';

// import { variables } from '../../styles/variables';
// import { mediaMin } from '../../styles/mediaQueries';
import { Divider } from '../shared';

import { sections } from '../../data/portfolio';

const PortfolioContainer = styled.div`
  flex-direction: column;
  align-items: center;
`;

const SectionSelector = styled.div`
  display: flex;
`;

const SectionButton = styled.button`
  background: transparent;
  border: none;
  text-transform: uppercase;
  text-shadow: 0px 0px 5px #ffffff40;
  position: relative;
  padding: 0 0 8px 0;
  margin: 0 2em;
  cursor: pointer;
  font-size: 1em;
  font-weight: 600;
  &:focus {
    outline: none;
  }
  &:before,
  &:after {
    content: '';
    position: absolute;
    bottom: 2px;
    left: 0;
    right: 0;
    height: 1px;
    background-color: #ffffff70;
    box-shadow: 0px 0px 5px 1px #ffffff40;
    transition: opacity 0.5s ease;
    opacity: ${props => (props.active ? '1' : '0')};
  }
`;

const Portfolio = () => {
  const [activeSection, setActiveSection] = useState('Development');
  const generateSectionSelector = () => {
    return sections.map(section => {
      return (
        <SectionButton
          active={activeSection === section}
          onClick={() => setActiveSection(section)}
        >
          {section}
        </SectionButton>
      );
    });
  };
  return (
    <Element name="portfolio">
      <PortfolioContainer className="container">
        <Divider />
        <SectionSelector>{generateSectionSelector()}</SectionSelector>
      </PortfolioContainer>
    </Element>
  );
};

export default Portfolio;
