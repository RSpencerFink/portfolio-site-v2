import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

import { mediaMin } from '../../styles/mediaQueries';

const reveal = keyframes`
    0%{
        fill: transparent;
    }
    100%{
        fill: #fff;

    }
`;

const outline = keyframes`
to {
    stroke-dashoffset: 0;
  }
`;

const LogoContainer = styled.svg`
  z-index: 100;
  fill: transparent;
  filter: drop-shadow(0px 0px 5px rgba(250, 250, 250, 0.4));
  width: 75%;
  ${mediaMin.tablet`
    width: 50%;
  `}
  ${mediaMin.tabletLandscape`
    width: 25%;
  `}
  .logo-path {
    stroke: #fff;
    stroke-width: 4px;
    animation: ${outline} 5s linear 1s forwards, ${reveal} 5s ease 6s forwards;
  }
`;

const Logo = () => {
  useEffect(() => {
    const path = document.querySelector('.logo-path');
    const length = path.getTotalLength();
    path.style.strokeDasharray = length + ' ' + length;
    path.style.strokeDashoffset = length;
  }, []);

  return (
    <LogoContainer
      version="1.1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      viewBox="0 0 1519.3 729.6"
    >
      <g>
        <path
          class="logo-path"
          d="M13.1,705.3c0-226.6,0-453.3,0-679.9c101.9,0,203.8-0.1,305.7,0c43.7,0.1,86.7,5.6,128,20.8
     c38.3,14.2,70.9,36.4,95.9,69.1c2,2.5,2.8,3.2,4.9,0c10.4-16.2,23.1-30.5,37.8-43C631.5,33,692.9,15.1,752.7,12.2
     c1.1-0.1,2.2-0.1,3.3-0.1c66.4-2.6,137.7,6.6,198.6,34.4c27.1,12.4,49.5,30.1,72.8,48.3c5.3,4.1,10,9,14.8,13.5
     c-31.5,50.7-62.7,101-93.8,151.1c-11.3-7.8-21.3-15.3-31.9-21.8c-44.8-27.6-93.4-43.4-146.2-44.9c-10-0.3-20.3,1-30.1,3.3
     c-14.3,3.3-21.7,14.5-20.6,28.4c0.9,11.3,8.4,17.7,17.6,22.6c18.3,9.6,38.4,14,58.4,18.3c39.1,8.3,78,17.2,115.6,31.1
     c30.9,11.4,60.5,25.3,86.1,46.4c0.5,0.4,1.4,0.4,2.2,0.6c0.2-0.8,0.5-1.3,0.5-1.8c0-48-0.1-96-0.1-144c0-2,0.3-4.4,1.3-6.1
     c7-11.3,14.2-22.5,21.3-33.7c10.1-15.9,20.2-31.8,30.2-47.8c0.7-1.1,0.2-3.6-0.7-4.7c-3.8-4.3-7.6-8.8-12-12.5
     c-12.4-10.1-25.3-19.8-37.8-29.9c-1.3-1-2.1-3.2-2.2-4.9c-0.2-9,0.2-18-0.2-27c-0.2-4.9,1.5-5.8,5.9-5.8
     c166.9,0.1,333.7,0.1,500.6,0c4.5,0,5.8,1.2,5.8,5.9c-0.2,60.5-0.1,121-0.1,181.5c0,7.4,0,7.4-7.2,7.4c-98.3,0-196.5,0-294.8-0.1
     c-4.3,0-5.7,1.1-5.7,5.6c0.2,24.5,0.1,49,0.1,73.5c0,7.3,0,7.3,7.3,7.3c90.9,0,181.9,0,272.8-0.1c4.4,0,6,0.9,6,5.8
     c-0.2,54.7-0.1,109.3-0.1,164c0,7.2,0,7.2-7.3,7.2c-90.1,0-180.2,0-270.3,0c-1.3,0-2.7,0.1-4,0c-3.5-0.3-4.4,1.4-4.4,4.8
     c0.1,70.7,0,141.3,0.2,212c0,5-1.2,6.5-6.3,6.5c-51.1-0.2-102.3-0.1-153.4-0.1c-13.5,0-27-0.1-40.5,0c-3.3,0-4.7-0.9-4.7-4.5
     c0.2-16.7,0.1-33.3,0.1-50c0-1-0.2-2.1-0.5-3.7c-1.2,0.9-1.9,1.3-2.4,1.8c-13,12.6-27.6,23-43.4,31.8
     c-28.3,15.8-59.6,26.3-91.6,31.2c-70.3,10.7-141.2,7-209.8-12c-13.5-3.7-26.8-8.1-39.8-13c-2-0.8-4.2-2.3-5.3-4.1
     c-11.6-18.3-23.1-36.7-34.5-55.1c-11.4-18.4-22.8-36.8-34.2-55.2c-5.5-9-11.1-17.9-16.6-26.8c21.4-28.4,42.6-56.5,63.6-84.6
     c2.2-3,3.6-2.1,5.9-0.2c60.5,49.8,129.8,76,208.3,76.9c12.5,0.1,25-0.3,36.9-5c9.4-3.8,16.1-9.9,17.6-20.5
     c1.6-11.4-2.6-20.3-12.3-26.4c-3.8-2.4-7.7-5-11.9-6.3c-21-6.3-42-13-63.2-18.1c-38.3-9.3-76.6-18.8-113.4-33.3
     c-31.3-12.4-60.9-27.6-85.8-50.7c-0.6-0.6-1.7-0.7-2.4-1c-0.4,0.3-0.6,0.4-0.7,0.5c-20.9,41.3-52.3,72.2-92.5,94.5
     c-3,1.6-3.5,3-1.6,6.2c14.8,24.5,29.2,49.3,43.9,73.8c7.5,12.5,15.5,24.9,23.3,37.2c10.7,17,21.5,33.9,32.1,50.9
     c10.7,17.1,21.2,34.4,31.8,51.6c2.7,4.4,5.5,8.7,8.9,14c-3.3,0-5.3,0-7.3,0c-73.3,0-146.6,0-219.8,0.1c-4.6,0-7.2-1.4-9.5-5.3
     c-17.8-30.4-35.8-60.7-53.7-91c-18.4-31.2-36.9-62.4-55.3-93.6c-2-3.3-4.2-5-8.3-4.8c-8.1,0.4-16.3-0.2-24.5,0.2
     c-4.9,0.2-6.1-1.3-6.1-6.2c0.2-49.8,0.1-99.7,0.1-149.5c0-6.9,0-6.9,6.6-6.9c21.3,0,42.6,0.2,64-0.1c10.5-0.1,21-0.3,31.3-1.9
     c30.1-4.7,54-23,56.7-57.4c1.7-20.7-1.8-40-17.8-55c-13-12.2-29.3-17.6-46.5-18.1c-32.6-1-65.3-0.5-97.9-0.8c-3.8,0-4.2,1.8-4.2,5
     c0.1,45.5,0,91,0,136.5c0,114.3,0,228.6,0.2,343c0,4.7-1.3,5.9-5.9,5.9c-64.4-0.1-128.9-0.1-193.4-0.1
     C17,706.2,15.1,705.6,13.1,705.3C13.1,705.3,13.1,705.3,13.1,705.3"
        />
      </g>
    </LogoContainer>
  );
};

export default Logo;
