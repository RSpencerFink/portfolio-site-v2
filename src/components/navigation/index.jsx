import React from 'react'
import styled from 'styled-components'
import {
    Link,
    Element,
    Events,
    animateScroll as scroll,
    scrollSpy,
    scroller,
} from 'react-scroll'

const NavigationContainer = styled.nav`
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 0 1.5em;
    height: 3em;
    width: 100%;
    position: fixed;
    top: 0;
    background-color: red;
    z-index: 100;
    transition: transform 0.25s ease-in-out;
    ${props => (props.hidden ? 'transform: translateY(-100%);' : '')}
`

const Left = styled.div`
    display: flex;
    flex-direction: row;
`
const Right = styled.div`
    display: flex;
    flex-direction: row;
    a {
        margin-left: 1em;
    }
`

export default class Navigation extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            activeElement: 'home',
        }
    }

    onSetActive = activeElement => {
        this.setState({ activeElement })
    }

    render() {
        const { activeElement } = this.state
        return (
            <NavigationContainer hidden={activeElement === 'home'}>
                <Left>
                    <Link
                        to="home"
                        spy={true}
                        smooth={true}
                        duration={500}
                        onSetActive={e => this.onSetActive(e)}
                    >
                        RSF
                    </Link>
                </Left>
                <Right>
                    <Link
                        to="about"
                        spy={true}
                        smooth={true}
                        duration={500}
                        onSetActive={e => this.onSetActive(e)}
                    >
                        About
                    </Link>
                    <Link
                        to="contact"
                        spy={true}
                        smooth={true}
                        duration={500}
                        onSetActive={e => this.onSetActive(e)}
                    >
                        Contact
                    </Link>
                </Right>
            </NavigationContainer>
        )
    }
}
