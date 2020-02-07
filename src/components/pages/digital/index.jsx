import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ReactPlayer from 'react-player';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import { VAContainer, ProjectList } from '../../shared';
import { digital } from '../../../data/digital';

import { mediaMin } from '../../../styles/mediaQueries';

const DigitalItem = styled(Link)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #fff;
  border: 1px solid #fff;
  width: 100%;
  margin: 0 0 16px 0;
  ${mediaMin.tablet`
  width: calc(50% - 32px);
  margin: 16px;
  `}
  ${mediaMin.tabletLandscape`
  width: calc(33% - 32px);
  margin: 16px;
  `}
  .info {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: absolute;
    width: 100%;
    height: 100%;
    padding: 8px;
    background-color: #00000080;
    opacity: 0;
    transition: opacity 0.5s ease;
    h4 {
      color: #fff;
      text-align: center;
      margin: 0;
      text-transform: uppercase;
    }
    &:hover {
      opacity: 1;
    }
  }
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const generateList = () => {
    return Object.entries(digital).map(([key, el]) => {
      return (
        <DigitalItem key={key} to={`/digital/${key}`}>
          <div className="info">
            <h4>{el.title}</h4>
          </div>
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
    <>
      <Helmet>
        <title>R. Spencer Fink | Visual Artist</title>
        <meta name="description" content="" />
      </Helmet>
      <VAContainer className="container">
        <ProjectList mounted={mounted} numItems={Object.keys(digital).length}>
          {generateList()}
        </ProjectList>
      </VAContainer>
    </>
  );
};

export default Digital;
