import React, { useState } from 'react';
import styled from 'styled-components';
import { Element } from 'react-scroll';
import axios from 'axios';

import { Divider } from 'components/shared';
import { variables } from 'styles/variables';
import { mediaMin } from 'styles/mediaQueries';

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
  ${mediaMin.tablet`
    width: 75%;
  `}
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
    height: 25vh;
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
    from_name: '',
    reply_to: '',
    message: ''
  });

  const handleChange = e => {
    e.persist();
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const clearForm = () => {
    setFormData({
      from_name: '',
      reply_to: '',
      message: ''
    });
  };

  const handleSubmit = e => {
    e.preventDefault();
    axios({
      method: 'post',
      url:
        'https://t0gf755wm0.execute-api.us-east-1.amazonaws.com/default/sendEmailFromPortfolio',
      data: JSON.stringify(formData)
    }).then(res => {
      if (res.status === 200) {
        clearForm();
      }
    });
  };

  return (
    <Element name="contact">
      <ContactContainer className="container">
        <Divider />
        <ContactForm onSubmit={handleSubmit}>
          <h2>CONTACT</h2>
          <input
            name="from_name"
            type="text"
            placeholder="Name"
            value={formData.from_name}
            onChange={handleChange}
          />
          <input
            name="reply_to"
            type="email"
            placeholder="Email"
            value={formData.reply_to}
            onChange={handleChange}
          />
          <textarea
            name="message"
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
