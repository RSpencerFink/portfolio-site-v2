import React, { useState } from 'react';
import styled from 'styled-components';
import { Element } from 'react-scroll';

const ContactContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  background-color: #191919;
  padding: 3em 0 0 0;
  box-sizing: border-box;
`;

const ContactForm = styled.form`
  display: flex;
  flex-direction: column;
  width: 25%;
  input,
  textarea {
    margin-bottom: 16px;
    padding: 8px;
    color: #fff;
    background-color: transparent;
    border: 1px solid #fff;
    font-size: 1.25em;
    &::placeholder {
      color: #fff;
    }
    textarea {
      resize: none;
    }
  }
`;

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = e => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Element name="contact">
      <ContactContainer>
        <ContactForm>
          <input name="name" type="text" placeholder="Name" />
          <input name="email" type="email" placeholder="Email" />
          <textarea name="message" type="textarea" placeholder="Message" />
        </ContactForm>
      </ContactContainer>
    </Element>
  );
};

export default Contact;
