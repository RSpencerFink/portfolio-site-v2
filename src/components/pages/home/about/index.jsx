import React from "react";
import styled from "styled-components";
import { Element } from "react-scroll";

import Resume from "./Resume";
import Tech from "./Tech";
import { Divider, DynamicImage } from "components/shared";

import { variables } from "styles/variables";
import { mediaMin } from "styles/mediaQueries";

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
              srcProp="assets/images/photos/about/rsf-headshot-2"
              altProp="photograph of spencer fink"
            />
          </Column>
          <Column>
            <p>
              I’m a Software Engineer with a strong background in building
              scalable, user-focused solutions. I specialize in developing tools
              that empower users, designing and optimizing algorithms, and
              creating efficient systems that drive business outcomes. With
              experience in both full-stack development and entrepreneurship,
              I’m passionate about solving complex problems and delivering
              impactful results. I enjoy collaborating with teams to bring
              creative and technical visions to life.
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
