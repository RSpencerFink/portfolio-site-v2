import React from "react";
import { Helmet } from "react-helmet";

import Landing from "./landing";
import About from "./about";
import Portfolio from "./portfolio";
import Contact from "./contact";

const Home = () => {
  return (
    <>
      <Helmet>
        <title>R. Spencer Fink | Software Engineer</title>
        <meta
          name="description"
          content="I’m a Software Engineer with a strong background in building scalable, user-focused solutions. I specialize in developing tools that empower users, designing and optimizing algorithms, and creating efficient systems that drive business outcomes. With experience in both full-stack development and entrepreneurship, I’m passionate about solving complex problems and delivering impactful results. I enjoy collaborating with teams to bring creative and technical visions to life."
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
