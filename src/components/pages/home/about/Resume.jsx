import React from 'react';
import styled from 'styled-components';

import { experience, education } from '../../../../data';
import ResumeSection from './ResumeSection';

const ResumeContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  width: 60%;
  h3 {
    text-align: center;
  }
`;

const Resume = () => {
  return (
    <ResumeContainer>
      <h3>EXPERIENCE</h3>
      {experience.map(job => {
        return <ResumeSection entry={job} />;
      })}
      <h3>EDUCATION</h3>
      {education.map(school => {
        return <ResumeSection entry={school} />;
      })}
    </ResumeContainer>
  );
};

export default Resume;
