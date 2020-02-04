import React from 'react';
import styled from 'styled-components';
import { useParams, Redirect } from 'react-router-dom';
import ReactPlayer from 'react-player';

import { digital } from '../../../data/digital';

const DigitalShowContainer = styled.div`
  flex-direction: column;
  align-items: center;
  .react-player {
    padding-top: 56.25%;
    height: unset;
  }
`;

const DigitalShow = () => {
  const { id } = useParams();
  const video = digital.get(parseInt(id));
  return digital.has(parseInt(id)) ? (
    <DigitalShowContainer className="container">
      <ReactPlayer
        className="react-player"
        url={video.url}
        width="100%"
        height="auto"
      />
    </DigitalShowContainer>
  ) : (
    <Redirect to="/digital" />
  );
};

export default DigitalShow;
