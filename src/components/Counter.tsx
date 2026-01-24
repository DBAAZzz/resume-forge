import { useCounterStore } from '../store';
import './Counter.css';

export const Counter = () => {
  const { count, increment, decrement, reset, incrementByAmount } = useCounterStore();

  return (
    <div className="counter-container">
      <h2>计数器示例</h2>
      <div className="counter-display">
        <span className="count-value">{count}</span>
      </div>
      <div className="counter-buttons">
        <button onClick={decrement} className="btn btn-danger">
          -1
        </button>
        <button onClick={increment} className="btn btn-primary">
          +1
        </button>
        <button onClick={() => incrementByAmount(5)} className="btn btn-success">
          +5
        </button>
        <button onClick={reset} className="btn btn-secondary">
          重置
        </button>
      </div>
    </div>
  );
};
