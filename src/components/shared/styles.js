import styled, { css } from 'styled-components';
import Masonry from 'react-masonry-component';

const VAContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const animateChildren = ({ numItems, mounted }) => {
  let childStyles = ``;
  for (let idx = 1; idx <= numItems; idx += 1) {
    childStyles += `
      &:nth-child(${idx}) {
        opacity: ${mounted ? '1' : '0'};
        background-color: ${mounted ? 'transparent' : '#ffffff50'};
        transition: opacity 0.5s ease ${idx *
          0.25}s, background-color 0.5s ease ${idx * 0.125}s;
      }
    `;
  }
  return css`
    ${childStyles}
  `;
};

const ProjectList = styled(Masonry)`
  padding: 0;
  width: 100%;
  & > * {
    ${animateChildren}
  }
`;

export { VAContainer, ProjectList };
