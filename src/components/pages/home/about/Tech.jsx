import React, { useState } from 'react';
import styled from 'styled-components';
import { Waypoint } from 'react-waypoint';

import { tech } from 'data';
import TechSection from './TechSection';
import { mediaMin } from 'styles/mediaQueries';

const TechContainer = styled.div`
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

const Tech = () => {
  const [mounted, setMounted] = useState({
    experience: false,
    education: false,
    button: false
  });
  return (
    <TechContainer>
      <Waypoint
        onEnter={() => {
          setMounted(prev => ({ ...prev, experience: true }));
        }}
      >
        <SectionTitle visible={mounted.experience}>TECH</SectionTitle>
      </Waypoint>
      {tech.map(section => {
        return <TechSection entry={section} />;
      })}
    </TechContainer>
  );
};

export default Tech;
