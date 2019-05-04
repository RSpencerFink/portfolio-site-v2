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

const AboutContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100%;
    background-color: blue;
    padding: 3em 0 0 0;
    box-sizing: border-box;
`

export default class About extends React.Component {
    render() {
        return (
            <Element name="about">
                <AboutContainer>
                    <span>about</span>
                    <span>about</span>
                </AboutContainer>
            </Element>
        )
    }
}
