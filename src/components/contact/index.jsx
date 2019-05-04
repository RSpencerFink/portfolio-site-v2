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

const ContactContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100%;
    background-color: green;
    padding: 3em 0 0 0;
    box-sizing: border-box;
`

const ContactForm = styled.form``

export default class Contact extends React.Component {
    render() {
        return (
            <Element name="contact">
                <ContactContainer>
                    <ContactForm />
                </ContactContainer>
            </Element>
        )
    }
}
