import React from 'react';
import Masonry from 'react-masonry-component';
import styled, { css } from 'styled-components';
import ReactPlayer from 'react-player';
import { Link } from 'react-router-dom';

import { VAContainer } from '../../shared';
import { digital } from '../../../data/digital';

import { mediaMin } from '../../../styles/mediaQueries';

const animateChildren = ({ numItems, mounted }) => {
  let childStyles = ``;
  for (let idx = 1; idx <= numItems; idx += 1) {
    childStyles += `
      &:nth-child(${idx}) {
        opacity: ${mounted ? '1' : '0'};
        background-color: ${mounted ? 'transparent' : '#ffffff50'};
        transition: opacity 0.5s ease ${idx *
          0.25}s, background-color 0.5s ease ${idx * 0.25}s;
      }
    `;
  }
  return css`
    ${childStyles}
  `;
};

const DigitalList = styled(Masonry)`
  padding: 0;
  width: 100%;
  & > * {
    ${animateChildren}
  }
`;

const DigitalItem = styled(Link)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #fff;
  border: 1px solid #fff;
  width: 100%;
  margin: 0 0 16px 0;
  ${mediaMin.tabletLandscape`
  width: calc(33% - 32px);
  margin: 16px;
  `}
  .react-player {
    pointer-events: none;
    .react-player__preview {
      padding-top: 56.25%;
      background-repeat: no-repeat;
      background-size: 100% 100%;
      .react-player__shadow {
        display: none !important;
      }
    }
  }
`;

const Digital = () => {
  const generateList = () => {
    return Array.from(digital, ([key, value]) => value).map(el => {
      return (
        <DigitalItem to={`/digital/${el.id}`}>
          <ReactPlayer
            light
            url={el.url}
            className="react-player"
            width="100%"
            height="unset"
          />
        </DigitalItem>
      );
    });
  };

  return (
    <VAContainer className="container">
      <h2>DIGITAL</h2>
      <DigitalList mounted={true} numItems={digital.size}>
        {generateList()}
      </DigitalList>
    </VAContainer>
  );
};

export default Digital;
