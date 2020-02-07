import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import { VAContainer, ProjectList, DynamicImage } from '../../shared';
import { analog } from '../../../data';

import { mediaMin } from '../../../styles/mediaQueries';

const AnalogItem = styled(Link)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #fff;
  border: 1px solid #fff;
  width: 100%;
  margin: 0 0 16px 0;
  min-height: 10vh;
  ${mediaMin.tablet`
  width: calc(50% - 32px);
  margin: 16px;
  min-height: 20vh;
  `}
  ${mediaMin.tabletLandscape`
  width: calc(33% - 32px);
  margin: 16px;
  min-height: initial;
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
`;

const Analog = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const generateList = () => {
    return Object.entries(analog).map(([key, el]) => {
      return (
        <AnalogItem key={key} to={`/analog/${key}`}>
          <div className="info">
            <h4>{el.title}</h4>
          </div>
          <DynamicImage srcProp={el.img} altProp={el.title} />
        </AnalogItem>
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
        <ProjectList mounted={mounted} numItems={Object.keys(analog).length}>
          {generateList()}
        </ProjectList>
      </VAContainer>
    </>
  );
};

export default Analog;
