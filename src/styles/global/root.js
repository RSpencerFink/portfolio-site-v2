import { createGlobalStyle } from 'styled-components';

const RootStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
  }
  html, body {
    background: #fff;
    max-width: 100vw;
  }
  body {
    margin: 0;
    padding: 0;
  }
  #root {
    margin: 0;
    padding: 0;
  }
`;

export default RootStyles;
