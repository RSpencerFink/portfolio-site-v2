import { createGlobalStyle } from 'styled-components';

const Typographystyles = createGlobalStyle`
  h1, h2, h3, h4, h5, h6, li, button, a, span, p {
    font-family: 'Roboto', sans-serif;
    font-style: normal;
    letter-spacing: .1rem;
    color: #fff;
  }
  h1{
    font-size: 2em;
  }
  h2{
    font-size: 1.75em;
  }
  h3{
    font-size: 1.5em;
  }
  h4{
    font-size: 1.25em;
  }
  h1, h2, h3, h4, h5, h6, li, button, a {
    text-shadow: 0px 0px 5px #ffffff40;

  }
  
  
  a {
    color: #fff;
    cursor: pointer;
    &:link,
    &:active,
    &:focus,
    &:visited {
      color: #fff;
    }
    text-decoration: none;
    &:hover {
      text-decoration: none;
    }
  }

  a.underline {
    color: #fff;
    position: relative;
    text-transform: uppercase;
    text-decoration: none;
    padding-bottom: 8px;
    text-shadow: 0px 0px 5px #ffffff40;
     &:before,
      &:after {
          content: '';
          position: absolute;
          bottom: 2px;
          left: 0; 
          right: 0;
          height: 1px;
          background-color: #ffffff70;
          box-shadow: 0px 0px 5px 1px #ffffff40;

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
