import React, { useState } from 'react';
import styled from 'styled-components';
import { Waypoint } from 'react-waypoint';

const ResumeSectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  opacity: ${props => (props.visible ? '1' : '0')};
  transition: opacity 0.5s ease 0.5s;
`;

const ResumeRow = styled.div`
  display: flex;
  width: 100%;
`;

const Time = styled.span`
  width: fit-content;
  transform: translateX(-50%);
  margin: 16px 0 16px 50%;
`;

const Left = styled.div`
  width: 50%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding-right: 32px;
  h4,
  h5 {
    margin: 0;
  }
  h5 {
    margin-top: 8px;
    opacity: 0.5;
  }
`;

const Right = styled.div`
  width: 50%;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #fff;
  padding-left: 32px;
  p {
    margin: 0;
    white-space: pre-line;
  }
`;

const ResumeSection = ({ entry }) => {
  const { heading, subHeading, body, start, end } = entry;
  const [mounted, setMounted] = useState(false);
  return (
    <Waypoint onEnter={() => setMounted(true)}>
      <ResumeSectionContainer visible={mounted}>
        {end && <Time>{end}</Time>}
        <ResumeRow>
          <Left>
            <h4>{heading}</h4>
            <h5>{subHeading}</h5>
          </Left>
          <Right>
            <p>{body}</p>
          </Right>
        </ResumeRow>
        {start && <Time>{start}</Time>}
      </ResumeSectionContainer>
    </Waypoint>
  );
};

export default ResumeSection;
