import styled from 'styled-components';

import { mediaMin } from 'styles/mediaQueries';

const Left = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
  padding: 0.5em 0;
  a {
    cursor: pointer;
    height: 100%;
    img {
      max-height: 100%;
      height: 100%;
    }
  }
`;

const Right = styled.ul`
  display: flex;
  flex-direction: row;
  list-style: none;
  padding: 0;
  a {
    cursor: pointer;
    margin-left: 1em;
    color: #fff;
    text-transform: uppercase;
    opacity: 0.5;
    font-size: 0.6em;
    ${mediaMin.phoneLarge`
        font-size: 0.75em;
    `}
    ${mediaMin.tablet`
        font-size: 1em;
    `}
    &.active {
      opacity: 1;
    }
    &:hover {
      text-decoration: none;
    }
  }
`;

export { Left, Right };
