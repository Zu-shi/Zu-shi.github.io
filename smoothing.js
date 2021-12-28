/**
 * Scan
 */
const scan = (reducer, init) => {
  const state = {
    accumulator: init,
    reducer: reducer,
    listener: () => {}
  };

  const next = v => {
    state.accumulator = reducer(state.accumulator, v);
    state.listener(state.accumulator);
  };

  const start = listener => {
    state.listener = listener;

    return { next };
  };

  return { start };
};


/**
 * Lerp
 */
const lerp = roundness => (accum, target) => {
  return Object.keys(accum).reduce((acc, key) => {
    acc[key] = (1 - roundness) * accum[key] + target[key] * roundness;
    return acc;
  }, {});
};


/**
 * rAF
 */
const rAF = () => {
  const state = {
    listener: () => {},
    animationFrameId: null
  };

  const loop = timeStamp => {
    state.listener(timeStamp);
    state.animationFrameId = requestAnimationFrame(timeStamp => {
      loop(timeStamp);
    });
  };

  const stop = () => {
    cancelAnimationFrame(state.animationFrameId);
  };

  const start = listener => {
    state.listener = listener;
    loop(Date.now());

    return { stop };
  };

  return { start };
};


/**
 * Smooth
 */
const smooth = (init, { roundness = 0.1 } = {}) => {
  const state = {
    scan: null,
    loop: null,
    target: init
  };

  const update = v => {
    state.target = v;
  };

  const stop = () => {
    state.raf.stop();
  };

  const start = listener => {
    state.scan = scan(lerp(roundness), init).start(listener);

    state.loop = rAF().start(() => {
      state.scan.next(state.target);
    });

    return { update, stop };
  };

  return { start };
};


/**
 * App
 */
const App = () => {
  const s = React.useMemo(() => {
    return smooth({ x: 0, y: 0 }).start(({ x, y }) => {
      document.body.style.setProperty(`--mouse-x`, x);
      document.body.style.setProperty(`--mouse-y`, y);
    });
  }, []);

  const updateCursorPosition = e => {
    s.update({ x: e.clientX, y: e.clientY });
  };
	
	React.useEffect(() => () => s.stop(), []);

  return (
    <div className="App" onMouseMove={updateCursorPosition}>
      <div className="mouse" />
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));