import React, { Component } from 'react'
import { Home, About, Navigation, Contact } from './components/_module'
import {
    Link,
    Element,
    Events,
    animateScroll as scroll,
    scrollSpy,
    scroller,
} from 'react-scroll'

class App extends Component {
    render() {
        return (
            <div className="App">
                <Navigation />
                <Home />
                <About />
                <Contact />
            </div>
        )
    }
}

export default App
