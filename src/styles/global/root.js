import { createGlobalStyle } from 'styled-components';
import { variables } from 'styles/variables';

const RootStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
  }
  html, body {
    background: #fff;
    max-width: 100vw;
    overscroll-behavior-y: none;
  }
  body {
    margin: 0;
    padding: 0;
  }
  #root {
    margin: 0;
    padding: 0;
  }

  ::-webkit-scrollbar {
    width: 10px;
  }
  
  /* Track */
  ::-webkit-scrollbar-track {
    background: #fff;
  }
  
  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: ${variables.colors.darkGrey};

  }
  
  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: #ffffff70;
  }
`;

export default RootStyles;
