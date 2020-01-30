import { createGlobalStyle } from 'styled-components';
// import { mediaMin } from '../mediaQueries'

const Container = createGlobalStyle`
.container{
    display: flex;
    height: 100vh;
    width: 100%;
    padding: 6em 3em;
    position: relative;  
}
`;

export default Container;
