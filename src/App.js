import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { Home, Analog, Digital } from './components/pages';
import { RootStyles, ContainerStyles, TypographyStyles } from './styles/global';

class App extends Component {
  render() {
    return (
      <>
        <RootStyles />
        <ContainerStyles />
        <TypographyStyles />
        <Router>
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/analog" component={Analog} />
            <Route path="/digital" component={Digital} />
          </Switch>
        </Router>
      </>
    );
  }
}

export default App;
