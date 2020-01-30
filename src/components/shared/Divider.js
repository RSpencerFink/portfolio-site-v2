import React from 'react';
import styled from 'styled-components';

const DividerContainer = styled.div`
  position: absolute;
  top: 0;
  left: 3em;
  right: 3em;
  width: calc(100% - 6em);
  height: 1px;
  border-top: 1px solid #ffffff70;
`;

const Divider = () => {
  return <DividerContainer />;
};

export default Divider;
