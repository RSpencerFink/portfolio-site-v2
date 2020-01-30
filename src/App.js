import React, { Component } from 'react';

import { Home, About, Navigation, Contact, Footer } from './components';
import { RootStyles, ContainerStyles, TypographyStyles } from './styles/global';

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
          <Footer />
        </div>
      </>
    );
  }
}

export default App;
