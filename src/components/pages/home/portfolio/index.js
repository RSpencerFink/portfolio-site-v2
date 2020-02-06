import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { Element } from 'react-scroll';
import { Waypoint } from 'react-waypoint';
import { Link } from 'react-router-dom';
import Masonry from 'react-masonry-component';

import { variables } from '../../../../styles/variables';
import { mediaMin } from '../../../../styles/mediaQueries';
import { Divider } from '../../../shared';

import { development } from '../../../../data/development';

const masonryOptions = {
  transitionDuration: '0.1s'
};

const animateChildren = ({ numItems, mounted }) => {
  let childStyles = ``;
  console.log(numItems);
  for (let idx = 1; idx <= numItems; idx += 1) {
    childStyles += `
      &:nth-child(${idx}) {
        opacity: ${mounted ? '1' : '0'};
        background-color: ${mounted ? 'transparent' : '#ffffff50'};
        transition: opacity 0.5s ease ${idx *
          0.25}s, background-color 0.5s ease ${idx * 0.25}s;
      }
    `;
  }
  return css`
    ${childStyles}
  `;
};

const PortfolioContainer = styled.div`
  flex-direction: column;
  align-items: center;
  h2 {
    margin: 0 0 32px 0;
  }
  a {
    margin: auto 0 0 0;
    color: #fff;
    border: 1px solid #fff;
    padding: 16px;
    &:visited {
      color: #fff;
    }
    &:hover {
      text-decoration: none;
      background-color: ${variables.colors.hoverGrey};
    }
  }
`;

const ProjectList = styled(Masonry)`
  padding: 0;
  width: 100%;
  margin-bottom: 64px;
  & > * {
    ${animateChildren}
  }
`;

const Project = styled.li`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #fff;
  border: 1px solid #fff;
  padding: 16px;
  width: 100%;
  margin: 0 0 16px 0;
  ${mediaMin.tabletLandscape`
  width: calc(50% - 32px);
  margin: 16px;
  `}
  h3 {
    font-size: 1.25em;
    margin: 0 0 16px 0;
  }
  .description {
    font-size: 0.75em;
    margin: 0 0 8px 0;
  }
  .tech {
    margin: 0 0 16px 0;
    font-size: 0.75em;
    font-style: italic;
    opacity: 0.5;
  }
  .links {
    display: flex;
    a {
      margin-right: 16px;
      padding: 8px;
      border: 1px solid #fff;
      color: #fff;
      text-transform: uppercase;
      font-size: 0.75em;
      &:hover {
        text-decoration: none;
        background-color: ${variables.colors.hoverGrey};
      }
    }
  }
`;

const Portfolio = () => {
  const [visible, setVisible] = useState(false);

  const renderProjects = () => {
    return development.map(project => {
      return (
        <Project key={project.title}>
          <h3>{project.title}</h3>
          <span className="description">{project.desc}</span>
          <span className="tech">{project.tech}</span>
          <div className="links">
            {project.repo && (
              <a href={project.repo} target="_blank" rel="noopener noreferrer">
                Repository
              </a>
            )}
            {project.link && (
              <a href={project.link} target="_blank" rel="noopener noreferrer">
                Live Site
              </a>
            )}
          </div>
        </Project>
      );
    });
  };

  return (
    <Element name="portfolio">
      <Waypoint
        onEnter={() => {
          setVisible(true);
        }}
      >
        <PortfolioContainer className="container">
          <Divider />
          <h2>PROJECTS</h2>
          <ProjectList
            options={masonryOptions}
            className="masonry"
            numItems={development.length}
            mounted={visible}
          >
            {renderProjects()}
          </ProjectList>
          <Link to="/analog">VISUAL ARTS PORTFOLIO</Link>
        </PortfolioContainer>
      </Waypoint>
    </Element>
  );
};

export default Portfolio;
