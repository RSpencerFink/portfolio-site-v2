import React, { useState } from 'react';
import styled from 'styled-components';
import { Element } from 'react-scroll';

import { variables } from '../../styles/variables';
import { mediaMin } from '../../styles/mediaQueries';
import { Divider } from '../shared';

const ContactContainer = styled.div`
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: ${variables.colors.darkGrey};
  position: relative;
`;

const ContactForm = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  width: 100%;
  ${mediaMin.tabletLandscape`
    width: 25%;
  `}
  h2 {
    text-align: center;
  }
  input,
  textarea,
  button {
    margin-bottom: 16px;
    padding: 8px;
    color: #fff;
    background-color: transparent;
    border: 1px solid #fff;
    font-size: 1.25em;
    &::placeholder {
      color: #fff;
      text-shadow: 0px 0px 5px #ffffff40;
    }
  }
  textarea {
    resize: none;
    height: 25%;
  }
  input,
  textarea {
    &:focus {
      outline: none;
      border: 1px solid #ffffff70;
      box-shadow: 0px 0px 5px 1px #ffffff40;
    }
  }
  button {
    cursor: pointer;
    &:hover {
      background: ${variables.colors.hoverGrey};
      box-shadow: 0px 0px 5px 1px #ffffff40;
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

  const handleSubmit = e => {
    e.preventDefault();
  };

  return (
    <Element name="contact">
      <ContactContainer className="container">
        <Divider />
        <ContactForm onSubmit={handleSubmit}>
          <h2>CONTACT</h2>
          <input
            name="name"
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
          <textarea
            name="message"
            type="textarea"
            placeholder="Message"
            value={formData.message}
            onChange={handleChange}
          />
          <button>Submit</button>
        </ContactForm>
      </ContactContainer>
    </Element>
  );
};

export default Contact;
