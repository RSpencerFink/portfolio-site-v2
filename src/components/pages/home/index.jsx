import React from 'react';
import { Helmet } from 'react-helmet';

import Landing from './landing';
import About from './about';
import Portfolio from './portfolio';
import Contact from './contact';

const Home = () => {
  return (
    <>
      <Helmet>
        <title>R. Spencer Fink | Software Engineer</title>
        <meta
          name="description"
          content="I’m Spencer. I’m a New York based software developer with strong
              skills in React / Redux, Ruby on Rails, Javascript, and
              PostgreSQL. I also have an extensive background in visual arts
              with an emphasis on photography, filmmaking, and painting. Let’s
              make something beautiful together."
        />
      </Helmet>
      <Landing />
      <About />
      <Portfolio />
      <Contact />
    </>
  );
};

export default Home;
