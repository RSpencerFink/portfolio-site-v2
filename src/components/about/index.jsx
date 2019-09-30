import React from 'react'
import styled from 'styled-components'
import DynamicImage from 'react-dynamic-image'
import {
    Link,
    Element,
    Events,
    animateScroll as scroll,
    scrollSpy,
    scroller,
} from 'react-scroll'

import { variables } from '../../styles/variables'

const AboutContainer = styled.div`
    display: flex;
    height: 100vh;
    width: 100%;
    background-color: ${variables.colors.darkGrey};
    padding: 6em 3em;
`

const Column = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 50%;
    img {
        max-width: 100%;
        max-height: 100%;
        width: 50%;
    }
    p {
        color: #fff;
        width: 50%;
        text-align: justify;
    }
`
const About = () => {
    return (
        <Element name="about">
            <AboutContainer>
                <Column>
                    <DynamicImage
                        srcProp="/images/photos/about/rsf-headshot"
                        altProp="photograph of spencer fink"
                    />
                </Column>
                <Column>
                    <p>
                        I’m Spencer. I’m a New York based software developer
                        with strong skills in React / Redux, Ruby on Rails,
                        Javascript, and PostgreSQL. I also have an extensive
                        background in visual arts with an emphasis on
                        photography, filmmaking, and painting. Let’s make
                        something beautiful together.
                    </p>
                </Column>
            </AboutContainer>
        </Element>
    )
}

export default About
