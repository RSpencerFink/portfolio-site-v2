import React from 'react';
import { Stage, Layer, Circle, Line } from 'react-konva';

export default class Background extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stars: [],
      lines: []
    };
  }

  componentDidMount() {
    this.generateStars(200);
    setInterval(this.animateStars, 16);
    document.addEventListener('resize', () => this.generateStars(200));
  }

  generateStars = numStars => {
    const { stars } = this.state;
    for (let idx = 0; idx < numStars; idx++) {
      stars.push(
        <Circle
          key={idx}
          x={Math.floor(Math.random() * window.innerWidth + 1)}
          y={Math.floor(Math.random() * window.innerHeight + 1)}
          radius={Math.random() * 2}
          velocity={[Math.random() * 0.5 - 0.25, Math.random() * 0.5 - 0.25]}
          fill="white"
          blurRadius={10}
        />
      );
    }
    this.setState({ stars });
  };

  animateStars = () => {
    const { stars } = this.state;
    const newStars = [];
    const xBound = window.innerWidth;
    const yBound = window.innerHeight;
    stars.forEach(el => {
      let newX = el.props.x;
      let newY = el.props.y;
      let newVel = el.props.velocity;
      const radius = el.props.radius;
      if (
        el.props.velocity[0] + el.props.x + radius >= xBound ||
        el.props.velocity[0] + el.props.x - radius <= 0
      ) {
        newVel[0] = -newVel[0];
      }
      if (
        el.props.velocity[1] + el.props.y + radius >= yBound ||
        el.props.velocity[1] + el.props.y - radius <= 0
      ) {
        newVel[1] = -newVel[1];
      }
      newX = el.props.x + newVel[0];
      newY = el.props.y + newVel[1];
      newStars.push(
        <Circle
          key={el.props.key}
          x={newX}
          y={newY}
          radius={el.props.radius}
          velocity={newVel}
          fill="white"
          shadowBlur={5}
          shadowColor="white"
        />
      );
    });
    this.setState({ stars: newStars });
    this.drawLines();
  };

  drawLines = () => {
    const xBounds = [window.innerWidth * 0.25, window.innerWidth * 0.75];
    const yBounds = [window.innerHeight * 0.25, window.innerHeight * 0.75];
    const { stars } = this.state;
    const lines = [];
    let inBoundStars = [];
    for (let idx = 0; idx < stars.length; idx++) {
      const sampleStar = stars[idx];

      if (
        sampleStar.props.x >= xBounds[0] &&
        sampleStar.props.x <= xBounds[1] &&
        sampleStar.props.y >= yBounds[0] &&
        sampleStar.props.y <= yBounds[1]
      ) {
        inBoundStars.push(stars[idx]);
      }
    }
    for (let idx = 0; idx < inBoundStars.length; idx++) {
      const StarOne = inBoundStars[idx];
      let deltas = [];
      for (let idx2 = 0; idx2 < inBoundStars.length; idx2++) {
        if (idx !== idx2) {
          const StarTwo = inBoundStars[idx2];
          deltas.push({
            delta: this.starDelta(
              StarOne.props.x,
              StarOne.props.y,
              StarTwo.props.x,
              StarTwo.props.y
            ),
            StarOne,
            StarTwo
          });
        }
      }
      deltas = deltas.sort((x, y) => {
        return x.delta - y.delta;
      });
      for (let idx = 0; idx < 4; idx++) {
        lines.push(
          <Line
            points={[
              deltas[idx].StarOne.props.x,
              deltas[idx].StarOne.props.y,
              deltas[idx].StarTwo.props.x,
              deltas[idx].StarTwo.props.y
            ]}
            stroke="white"
            strokeWidth={0.25}
          />
        );
      }
    }
    this.setState({ lines });
  };

  starDelta = (x1, y1, x2, y2) => {
    let netX;
    let netY;
    if (x1 >= x2) {
      netX = x1 - x2;
    } else {
      netX = x2 - x1;
    }
    if (y1 >= y2) {
      netY = y1 - y2;
    } else {
      netY = y2 - y1;
    }
    return Math.sqrt(netX * netX + netY * netY);
  };

  render() {
    const { stars, lines } = this.state;
    return (
      <Stage
        className="canvas"
        width={window.innerWidth}
        height={window.innerHeight}
      >
        <Layer>
          {stars}
          {lines}
        </Layer>
      </Stage>
    );
  }
}
