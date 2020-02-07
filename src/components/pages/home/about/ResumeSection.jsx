import React, { useState } from 'react';
import styled from 'styled-components';
import { Waypoint } from 'react-waypoint';

import { mediaMin } from '../../../../styles/mediaQueries';

const ResumeSectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  transition: opacity 0.5s ease 0.5s, transform 0.5s ease 0.5s;
  opacity: ${props => (props.visible ? '1' : '0')};
  transform: translateY(${props => (props.visible ? '0' : '8px')});
`;

const ResumeRow = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  ${mediaMin.tablet`
    flex-direction: row;
  `}
`;

const Time = styled.span`
  width: fit-content;
  margin: 32px 0;
  ${mediaMin.tablet`
  margin: 16px 0 16px 50%;
  transform: translateX(-50%);
  `}
`;

const Left = styled.div`
  width: 100%;
  ${mediaMin.tablet`
  width: 50%;
  align-items: flex-end;
  padding-right: 32px;
`}
  display: flex;
  flex-direction: column;
  h4,
  h5 {
    margin: 0;
  }
  h5 {
    margin-top: 8px;
    opacity: 0.5;
    margin-bottom: 16px;
  }
`;

const Right = styled.div`
  width: 100%;
  ${mediaMin.tablet`
  width: 50%;
  padding-left: 32px;
  border-left: 1px solid #fff;
`}
  display: flex;
  flex-direction: column;
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
