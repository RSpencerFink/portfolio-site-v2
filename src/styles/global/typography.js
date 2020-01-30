import { createGlobalStyle } from 'styled-components';
// import { mediaMin } from '../mediaQueries'

const Typographystyles = createGlobalStyle`
  h1, h2, h3, h4, h5, h6, li {
    font-family: 'Roboto', sans-serif;
    font-style: normal;
    letter-spacing: .1rem;
    color: #fff;
  }
  
  p {
    font-family: 'Roboto', sans-serif;
    font-style: normal;
  }
  
  
  a {
    &:link,
    &:active,
    &:focus,
    &:visited {
      color: #000;
    }
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }

  a.underline {
    font-size: 20px;
    color: #fff;
    position: relative;
    text-transform: uppercase;
    text-decoration: none;
    padding-bottom: 8px;
  
     &:before,
      &:after {
          content: '';
          position: absolute;
          bottom: 2px;
          left: 0; 
          right: 0;
          height: 2px;
          background-color: #fff;
      }
      &:before {
          opacity: 0;
          transform: translateY(-8px);
          transition: transform 0s cubic-bezier(0.175, 0.885, 0.320, 1.275), opacity 0s;
      }
      &:after {
          opacity: 0;
          transform: translateY(4px);
          transition: transform .2s cubic-bezier(0.175, 0.885, 0.320, 1.275), opacity .2s;
      }
      &:hover,
      &:focus {
          &:before,
          &:after {
              opacity: 1;
              transform: translateY(0);
          }
          &:before {
              transition: transform .2s cubic-bezier(0.175, 0.885, 0.320, 1.275), opacity .2s;
          }
          &:after {
              transition: transform 0s .2s cubic-bezier(0.175, 0.885, 0.320, 1.275), opacity 0s .2s;
          }
      }
  }
`;

export default Typographystyles;
