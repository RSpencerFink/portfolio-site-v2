import React, { useState } from 'react'
import styled from 'styled-components'
import {
    Link,
    Element,
    Events,
    animateScroll as scroll,
    scrollSpy,
    scroller,
} from 'react-scroll'

import { variables } from '../../styles/variables'

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
    background-color: ${variables.colors.hoverGrey};
    z-index: 100;
    transition: transform 0.25s ease-in-out;
    ${props => (props.hidden ? 'transform: translateY(-100%);' : '')}
`

const Left = styled.div`
    display: flex;
    flex-direction: row;
    height: 100%;
    padding: 0.5em 0;
    a {
        cursor: pointer;
        height: 100%;
        img {
            max-height: 100%;
        }
    }
`
const Right = styled.ul`
    display: flex;
    flex-direction: row;
    list-style: none;
    a {
        cursor: pointer;
        margin-left: 1em;
        color: #fff;
        text-transform: uppercase;
        opacity: 0.5;
        &.active {
            opacity: 1;
        }
        &:hover {
            text-decoration: none;
        }
    }
`

const Navigation = () => {
    const [activeElement, setActiveElement] = useState('home')

    const onSetActive = activeElement => {
        setActiveElement(activeElement)
    }

    return (
        <NavigationContainer hidden={activeElement === 'home'}>
            <Left>
                <Link
                    to="home"
                    spy={true}
                    smooth={true}
                    duration={500}
                    onSetActive={e => onSetActive(e)}
                >
                    <img src="/images/icons/rsf-white.png" />
                </Link>
            </Left>
            <Right>
                <Link
                    to="about"
                    spy={true}
                    smooth={true}
                    duration={500}
                    onSetActive={e => onSetActive(e)}
                >
                    <li>About</li>
                </Link>
                <Link
                    to="contact"
                    spy={true}
                    smooth={true}
                    duration={500}
                    onSetActive={e => onSetActive(e)}
                >
                    <li>Contact</li>
                </Link>
            </Right>
        </NavigationContainer>
    )
}
export default Navigation
