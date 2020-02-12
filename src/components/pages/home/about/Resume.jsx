import React, { useState } from 'react';
import styled from 'styled-components';
import { Waypoint } from 'react-waypoint';

import { experience, education } from 'data';
import ResumeSection from './ResumeSection';
import Downloadable from 'assets/documents/R. Spencer Fink Resume.pdf';
import { mediaMin } from 'styles/mediaQueries';
import { variables } from 'styles/variables';

const ResumeContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 2em auto;
  width: 100%;
  ${mediaMin.tabletLandscape`
    width: 60%;
  `}
`;

const SectionTitle = styled.h3`
  text-align: center;
  transition: opacity 0.5s ease 0.5s, transform 0.5s ease 0.5s;
  opacity: ${props => (props.visible ? '1' : '0')};
  transform: translateY(${props => (props.visible ? '0' : '8px')});
`;

const DownloadButton = styled.a`
  width: 100%;
  border: 1px solid #fff;
  text-align: center;
  padding: 16px;
  transition: opacity 0.5s ease 0.5s, transform 0.5s ease 0.5s;
  opacity: ${props => (props.visible ? '1' : '0')};
  transform: translateY(${props => (props.visible ? '0' : '8px')});
  margin: 2em auto 0 auto;
  ${mediaMin.tabletLandscape`
    width: 50%;
  `}
  &:hover {
    background-color: ${variables.colors.hoverGrey};
  }
`;

const Resume = () => {
  const [mounted, setMounted] = useState({
    experience: false,
    education: false,
    button: false
  });
  return (
    <ResumeContainer>
      <Waypoint
        onEnter={() => {
          setMounted(prev => ({ ...prev, experience: true }));
        }}
      >
        <SectionTitle visible={mounted.experience}>EXPERIENCE</SectionTitle>
      </Waypoint>
      {experience.map(job => {
        return <ResumeSection entry={job} />;
      })}
      <Waypoint
        onEnter={() => {
          setMounted(prev => ({ ...prev, education: true }));
        }}
      >
        <SectionTitle visible={mounted.education}>EDUCATION</SectionTitle>
      </Waypoint>
      {education.map(school => {
        return <ResumeSection entry={school} />;
      })}
      <Waypoint
        onEnter={() => {
          setMounted(prev => ({ ...prev, button: true }));
        }}
      >
        <DownloadButton
          visible={mounted.button}
          href={Downloadable}
          target="_blank"
          rel="noopener noreferrer"
        >
          DOWNLOAD
        </DownloadButton>
      </Waypoint>
    </ResumeContainer>
  );
};

export default Resume;
