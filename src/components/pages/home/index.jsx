import React from 'react';
import styled from 'styled-components';

import Landing from './landing';
import About from './about';
import Portfolio from './portfolio';
import Contact from './contact';
import { Navigation, Footer } from '../../';

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
