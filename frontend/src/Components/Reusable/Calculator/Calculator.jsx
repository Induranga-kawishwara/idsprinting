import React, { useState, useEffect, useCallback } from "react";
import { evaluate } from "mathjs";
import Draggable from "react-draggable";
import "./Calculator.scss";

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

  const handleKeyPress = useCallback(
    (e) => {
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
    },
    [result]
  );

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
    <Draggable cancel=".Calculator-button, .close-button">
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
            <button
              onClick={clear}
              id="clear"
              className="highlight Calculator-button"
            >
              AC
            </button>
            <button
              onClick={handleDelete}
              className="highlight Calculator-button"
            >
              DEL
            </button>
            <button
              name="("
              onClick={handleClick}
              className="highlight Calculator-button"
            >
              (
            </button>
            <button
              name=")"
              onClick={handleClick}
              className="highlight Calculator-button"
            >
              )
            </button>

            <button
              name="7"
              onClick={handleClick}
              className="Calculator-button"
            >
              7
            </button>
            <button
              name="8"
              onClick={handleClick}
              className="Calculator-button"
            >
              8
            </button>

            <button
              name="9"
              onClick={handleClick}
              className="Calculator-button"
            >
              9
            </button>
            <button
              name="/"
              onClick={handleClick}
              className="highlight Calculator-button"
            >
              &divide;
            </button>
            <button
              name="4"
              onClick={handleClick}
              className="Calculator-button"
            >
              4
            </button>
            <button
              name="5"
              onClick={handleClick}
              className="Calculator-button"
            >
              5
            </button>
            <button
              name="6"
              onClick={handleClick}
              className="Calculator-button"
            >
              6
            </button>
            <button
              name="*"
              onClick={handleClick}
              className="highlight Calculator-button"
            >
              &times;
            </button>

            <button
              name="1"
              onClick={handleClick}
              className="Calculator-button"
            >
              1
            </button>
            <button
              name="2"
              onClick={handleClick}
              className="Calculator-button"
            >
              2
            </button>
            <button
              name="3"
              onClick={handleClick}
              className="Calculator-button"
            >
              3
            </button>
            <button
              name="-"
              onClick={handleClick}
              className="highlight Calculator-button"
            >
              -
            </button>

            <button
              name="0"
              onClick={handleClick}
              className="Calculator-button"
            >
              0
            </button>
            <button
              name="."
              onClick={handleClick}
              className="Calculator-button"
            >
              .
            </button>
            <button></button>
            <button
              name="+"
              onClick={handleClick}
              className="highlight Calculator-button"
            >
              +
            </button>
            <button
              onClick={calculate}
              id="equal"
              className="highlight Calculator-button"
            >
              =
            </button>
          </div>
        </div>
      </div>
    </Draggable>
  );
};

export default Calculator;
