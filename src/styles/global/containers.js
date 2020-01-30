import { createGlobalStyle } from 'styled-components';
import { variables } from '../variables';

const Container = createGlobalStyle`
.container{
    display: flex;
    min-height: 100vh;
    width: 100%;
    padding: 6em 3em;
    position: relative;
    background-color: ${variables.colors.darkGrey};
}
`;

export default Container;
