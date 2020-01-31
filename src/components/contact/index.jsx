import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Element } from 'react-scroll';
import emailjs from 'emailjs-com';

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
  useEffect(() => {
    emailjs.init(process.env.REACT_APP_EMAILJS_USER_ID);
  }, []);

  const [formData, setFormData] = useState({
    from_name: '',
    reply_to: '',
    message_html: ''
  });

  const handleChange = e => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    emailjs.send(
      process.env.REACT_APP_SERVICE_ID,
      process.env.REACT_APP_TEMPLATE_ID,
      formData
    );
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
            name="message_html"
            type="textarea"
            placeholder="Message"
            value={formData.message_html}
            onChange={handleChange}
          />
          <button>Submit</button>
        </ContactForm>
      </ContactContainer>
    </Element>
  );
};

export default Contact;
