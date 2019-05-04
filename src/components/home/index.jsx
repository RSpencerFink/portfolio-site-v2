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

const HomeContainer = styled.div`
    height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: #191919;
    color: #fff;
    a {
        margin-top: 6em;
    }
`

const HomeLogo = styled.h1`
    font-size: 32px;
`

const ContinueButton = styled.button`
    width: 240px;
    height: 64px;
    background: #191919;
    border 1px solid #fff;
    color: #fff;
    cursor: pointer;
    &:hover{
        background-color: #2b2b2b;
    }
`

export default class Home extends React.Component {
    render() {
        return (
            <Element name="home">
                <HomeContainer>
                    <HomeLogo>RSF</HomeLogo>
                    <Link to="about" spy={true} smooth={true} duration={500}>
                        <ContinueButton>Continue</ContinueButton>
                    </Link>
                </HomeContainer>
            </Element>
        )
    }
}
