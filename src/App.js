import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { Navigation, Footer, ScrollToTop } from './components';
import { Home, Analog, Digital, DigitalShow } from './components/pages';
import { RootStyles, ContainerStyles, TypographyStyles } from './styles/global';

const App = () => {
  return (
    <div className="App">
      <RootStyles />
      <ContainerStyles />
      <TypographyStyles />
      <Router>
        <ScrollToTop>
          <Navigation />
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/analog/:id" component={Analog} />
            <Route path="/analog" component={Analog} />
            <Route path="/digital/:id" component={DigitalShow} />
            <Route path="/digital" component={Digital} />
          </Switch>
          <Footer />
        </ScrollToTop>
      </Router>
    </div>
  );
};

export default App;
