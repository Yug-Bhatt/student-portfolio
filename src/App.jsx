import "./App.css";

import Header from "./components/Header";
import About from "./components/About";
import Education from "./components/Education";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Certificates from "./components/Certificates";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="container">
      <Header
        name="Yug Bhatt"
        course="B.Tech Artificial Intelligence & Machine Learning"
      />

      <About />
      <Education />
      <Skills />
      <Projects />
      <Certificates />
      <Contact />

      <Footer email="yugbhatt75@gmail.com" />
    </div>
  );
}

export default App;