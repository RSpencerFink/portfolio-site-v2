import React from 'react';
import styled from 'styled-components';
import { useParams, Redirect, Link } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { Helmet } from 'react-helmet';

import { digital } from '../../../data/digital';
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
`;

const VideoWrapper = styled.div`
  position: relative;
  padding-top: 56.25%;
  .react-player {
    position: absolute;
    top: 0;
    height: 100%;
    width: 100%;
    border: 1px solid #fff;
    iframe {
      width: 100%;
      height: 100%;
    }
  }
`;

const DigitalShow = () => {
  const { id } = useParams();
  const video = digital[id];
  return video ? (
    <>
      <Helmet>
        <title>R. Spencer Fink | {video.title}</title>
        <meta name="description" content="" />
      </Helmet>
      <DigitalShowContainer className="container">
        <div className="row">
          <div className="row-section">
            <Link className="back" to="/digital">
              <img src={Back} alt="back" />
            </Link>
            <h2>{video.title}</h2>
          </div>
          <span>{video.roles}</span>
        </div>
        <VideoWrapper>
          <ReactPlayer
            className="react-player"
            url={video.url}
            width="100%"
            height="100%"
          />
        </VideoWrapper>
        {video.description && <p>{video.description}</p>}
      </DigitalShowContainer>
    </>
  ) : (
    <Redirect to="/digital" />
  );
};

export default DigitalShow;
