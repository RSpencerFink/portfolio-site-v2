import React, { Component } from 'react';

import { Home, About, Navigation, Contact } from './components';
import { RootStyles, ContainerStyles, TypographyStyles } from './styles/global';
import {
  Link,
  Element,
  Events,
  animateScroll as scroll,
  scrollSpy,
  scroller
} from 'react-scroll';

class App extends Component {
  render() {
    return (
      <>
        <RootStyles />
        <ContainerStyles />
        <TypographyStyles />
        <div className="App">
          <Navigation />
          <Home />
          <About />
          <Contact />
        </div>
      </>
    );
  }
}

export default App;
