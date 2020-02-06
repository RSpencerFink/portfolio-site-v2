import React, { useState } from 'react';
import styled from 'styled-components';
import { Waypoint } from 'react-waypoint';

import ResumeSection from './ResumeSection';
import { experience, education } from '../../../../data';
import { mediaMin } from '../../../../styles/mediaQueries';

const ResumeContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 auto;
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

const Resume = () => {
  const [mounted, setMounted] = useState({
    experience: false,
    education: false
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
    </ResumeContainer>
  );
};

export default Resume;
