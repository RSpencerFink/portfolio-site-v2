import { createGlobalStyle } from 'styled-components'

const RootStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
  }
  html, body {
    width: 100%;
    height: 100%;
    background: #fff;
  }
  body {
    margin: 0;
    padding: 0;
  }
  #root {
    height: 100%;
    margin: 0;
    padding: 0;
  }
`

export default RootStyles
