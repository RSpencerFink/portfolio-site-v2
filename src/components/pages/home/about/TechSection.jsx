import React, { useState } from 'react';
import styled from 'styled-components';
import { Waypoint } from 'react-waypoint';

import { mediaMin } from '../../../../styles/mediaQueries';

const TechSectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 0 0 2em 0;
  ${mediaMin.tabletLandscape`
  margin: 0 0 4em 0;
  `}
  transition: opacity 0.5s ease 0.5s, transform 0.5s ease 0.5s;
  opacity: ${props => (props.visible ? '1' : '0')};
  transform: translateY(${props => (props.visible ? '0' : '8px')});
`;

const TechRow = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  ${mediaMin.tablet`
    flex-direction: row;
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
  h4 {
    margin-bottom: 2em;
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
`;

const TechList = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0;
  span {
    display: flex;
    margin-bottom: 16px;
    align-items: center;
    svg {
      margin-right: 1em;
    }
  }
`;

const TechSection = ({ entry }) => {
  const { heading, body } = entry;
  const [mounted, setMounted] = useState(false);
  return (
    <Waypoint onEnter={() => setMounted(true)}>
      <TechSectionContainer visible={mounted}>
        <TechRow>
          <Left>
            <h4>{heading}</h4>
          </Left>
          <Right>
            <TechList>
              {body.map(el => (
                <>
                  <span>
                    {el.icon}
                    {el.name}
                  </span>
                </>
              ))}
            </TechList>
          </Right>
        </TechRow>
      </TechSectionContainer>
    </Waypoint>
  );
};

export default TechSection;
