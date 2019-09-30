import { createGlobalStyle } from 'styled-components'
import { mediaMin } from '../mediaQueries'

const Typographystyles = createGlobalStyle`
  h1, h2, h3, h4, h5, h6, li {
    font-family: 'Roboto', sans-serif;
    font-style: normal;
    letter-spacing: .1rem;
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
`

export default Typographystyles
