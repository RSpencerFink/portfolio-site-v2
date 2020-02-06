import React from 'react';
import styled from 'styled-components';
import { useParams, Redirect, Link } from 'react-router-dom';

import { DynamicImage } from '../../shared';
import { analog } from '../../../data';
import { mediaMin } from '../../../styles/mediaQueries';
import Back from '../../../assets/images/icons/back.svg';

const DigitalShowContainer = styled.div`
  flex-direction: column;

  .row {
    display: flex;
    flex-direction: column;
    margin-bottom: 1em;
    ${mediaMin.tabletLandscape`
        flex-direction: row;
        justify-content: space-between;
        align-items: flex-end;
    `}
    .row-section {
      display: flex;
      .back {
        display: none;
        ${mediaMin.tabletLandscape`
          display: block;
        `}
        margin: 0 16px 0 0;
        height: 32px;
        img {
          height: 100%;
        }
      }
    }
    h2 {
      margin: 0;
    }
    span {
      opacity: 0.5;
    }
  }
  p {
    white-space: pre-line;
  }
  .image-container {
    display: flex;
    max-height: 75vh;
    img {
      max-height: 100%;
      max-width: 100%;
      object-fit: contain;
    }
  }
`;

const DigitalShow = () => {
  const { id } = useParams();
  const painting = analog[id];
  return painting ? (
    <DigitalShowContainer className="container">
      <div className="row">
        <div className="row-section">
          <Link className="back" to="/analog">
            <img src={Back} alt="back" />
          </Link>
          <h2>{painting.title}</h2>
        </div>
        <span>{painting.size}</span>
      </div>
      <div className="image-container">
        <DynamicImage
          srcProp={painting.img}
          altProp={painting.title}
          noStyles
        />
      </div>
      <p>{painting.medium}</p>
    </DigitalShowContainer>
  ) : (
    <Redirect to="/digital" />
  );
};

export default DigitalShow;
