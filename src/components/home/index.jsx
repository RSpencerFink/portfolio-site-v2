import React from 'react';
import styled from 'styled-components';

import {
  Landing,
  About,
  Navigation,
  Contact,
  Portfolio,
  Footer
} from '../../components';

const Home = () => {
  return (
    <div className="App">
      <Navigation />
      <Landing />
      <About />
      <Portfolio />
      <Contact />
      <Footer />
    </div>
  );
};

export default Home;
