import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { Element } from 'react-scroll';
import { Waypoint } from 'react-waypoint';
import { Link } from 'react-router-dom';

import { variables } from '../../styles/variables';
import { mediaMin } from '../../styles/mediaQueries';
import { Divider } from '../shared';

import { development } from '../../data/portfolio';

const animateChildren = ({ numItems, mounted }) => {
  let childStyles = ``;
  for (let idx = 1; idx <= numItems; idx += 1) {
    childStyles += `
      &:nth-child(${idx}) {
        opacity: ${mounted ? '1' : '0'};
        // transform: ${mounted ? 'translateY(0)' : 'translateY(-8px)'};
        transition: opacity 0.25s ease-in-out ${idx *
          0.125}s, transform 0.25s ease-in-out ${idx * 0.125}s;
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

const ProjectList = styled.ul`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 0;
  width: 100%;
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
      <PortfolioContainer className="container">
        <Divider />
        <h3>PROJECTS</h3>
        <Waypoint
          onEnter={() => {
            console.log('here');
            setVisible(true);
          }}
        >
          <ProjectList numItems={development.length} mounted={visible}>
            {renderProjects()}
          </ProjectList>
        </Waypoint>
        <Link to="/analog">VISUAL ARTS PORTFOLIO</Link>
      </PortfolioContainer>
    </Element>
  );
};

export default Portfolio;
