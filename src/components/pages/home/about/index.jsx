import React from 'react';
import styled from 'styled-components';
import { Element } from 'react-scroll';
import { DynamicImage } from '../../../shared';

import Resume from './Resume';
import Tech from './Tech';
import { Divider } from '../../../shared';
import { variables } from '../../../../styles/variables';
import { mediaMin } from '../../../../styles/mediaQueries';

const AboutContainer = styled.div`
  background-color: ${variables.colors.darkGrey};
  flex-direction: column;
`;

const MainRow = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  ${mediaMin.tabletLandscape`
    flex-direction: row;
  `}
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  ${mediaMin.tabletLandscape`
    width: 50%;
  `}
  img {
    border: 1px solid #fff;
    max-width: 100%;
    max-height: 100%;
    margin-bottom: 1em;
    width: 100%;
    ${mediaMin.tabletLandscape`
      margin-bottom: 0;
      width: 50%;
    `}
  }
  p {
    color: #fff;
    text-align: justify;
    width: 100%;
    ${mediaMin.tabletLandscape`
      width: 50%;
    `}
  }
`;

const About = () => {
  return (
    <Element name="about">
      <AboutContainer className="container">
        <Divider />
        <MainRow>
          <Column>
            <DynamicImage
              srcProp="assets/images/photos/about/rsf-headshot"
              altProp="photograph of spencer fink"
            />
          </Column>
          <Column>
            <p>
              I’m Spencer. I’m a New York based software developer with strong
              skills in React / Redux, Ruby on Rails, Javascript, and
              PostgreSQL. I also have an extensive background in visual arts
              with an emphasis on photography, filmmaking, and painting. Let’s
              make something beautiful together.
            </p>
          </Column>
        </MainRow>
        <Tech />
        <Resume />
      </AboutContainer>
    </Element>
  );
};

export default About;
