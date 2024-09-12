import "./Calculator.scss";
import { useState, useEffect } from "react";
import { evaluate } from "mathjs";

const Calculator = ({ onClose }) => {
  const [result, setResult] = useState("");

  const handleClick = (e) => {
    setResult(result.concat(e.target.name));
  };

  const clear = () => {
    setResult("");
  };

  const handleDelete = () => {
    setResult(result.slice(0, -1));
  };

  const calculate = () => {
    try {
      setResult(evaluate(result).toString());
    } catch {
      setResult("Error");
    }
  };

  const handleKeyPress = (e) => {
    const { key } = e;

    if (
      (/\d/.test(key) || ["+", "-", "*", "/", ".", "(", ")"].includes(key)) &&
      result !== "Error"
    ) {
      setResult(result.concat(key));
    } else if (key === "Enter") {
      e.preventDefault(); // Prevent form submission
      calculate();
    } else if (key === "Backspace") {
      handleDelete();
    } else if (key === "Escape") {
      clear();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="Calculator">
      <div className="Calculator-header">
        <h1>Calculator</h1>
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="container">
        <form onSubmit={handleSubmit}>
          <input type="text" value={result} readOnly />
        </form>

        <div className="keypad">
          <button onClick={clear} id="clear" className="highlight">
            AC
          </button>
          <button onClick={handleDelete} className="highlight">
            DEL
          </button>
          <button name="(" onClick={handleClick} className="highlight">
            (
          </button>
          <button name=")" onClick={handleClick} className="highlight">
            )
          </button>

          <button name="7" onClick={handleClick}>
            7
          </button>
          <button name="8" onClick={handleClick}>
            8
          </button>

          <button name="9" onClick={handleClick}>
            9
          </button>
          <button name="/" onClick={handleClick} className="highlight">
            &divide;
          </button>
          <button name="4" onClick={handleClick}>
            4
          </button>
          <button name="5" onClick={handleClick}>
            5
          </button>
          <button name="6" onClick={handleClick}>
            6
          </button>
          <button name="*" onClick={handleClick} className="highlight">
            &times;
          </button>

          <button name="1" onClick={handleClick}>
            1
          </button>
          <button name="2" onClick={handleClick}>
            2
          </button>
          <button name="3" onClick={handleClick}>
            3
          </button>
          <button name="-" onClick={handleClick} className="highlight">
            -
          </button>

          <button name="0" onClick={handleClick}>
            0
          </button>
          <button name="." onClick={handleClick}>
            .
          </button>
          <button></button>
          <button name="+" onClick={handleClick} className="highlight">
            +
          </button>
          <button onClick={calculate} id="equal" className="highlight">
            =
          </button>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
