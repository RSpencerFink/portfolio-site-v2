import React from 'react';
import styled from 'styled-components';

const GradientContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 6em;
  background-image: linear-gradient(${props => `${props.from}, ${props.to}`});
`;

const Gradient = ({ from, to }) => {
  return <GradientContainer from={from} to={to} />;
};

export default Gradient;
