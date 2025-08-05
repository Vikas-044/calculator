const display = document.getElementById("display");
const upperDisplay = document.getElementById("upperDisplay");
const buttons = document.querySelectorAll(".container-column");

let currentInput = "";
let lastInput = "";

let isDisplayClear = false;

function calculateExpression(expr) {
  try {
    return eval(expr);
  } catch {
    return "Error";
  }
}

function factorial(n) {
  if (n < 0) return "Error";
  if (n === 0 || n === 1) return 1;
  return n * factorial(n - 1);
}

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const value = btn.textContent;

    // if (btn.classList.contains("digit") && currentInput) {
    //   console.log(currentInput);
    //   upperDisplay.textContent = "0";
    //   isDisplayClear = true;
    // }

    switch (value) {
      case "=":
        upperDisplay.textContent = currentInput;
        currentInput = calculateExpression(currentInput).toString();
        display.textContent = currentInput;
        break;
      case "AC":
        currentInput = "";
        display.textContent = "0";
        upperDisplay.textContent = "0";
        break;
      case "+/-":
        if (currentInput.startsWith("-")) {
          currentInput = currentInput.slice(1);
        } else {
          currentInput = "-" + currentInput;
        }
        display.textContent = currentInput;
        break;
      case "x²":
        currentInput = `(${currentInput})**2`;
        display.textContent = currentInput;
        break;
      case "√":
        currentInput = `Math.sqrt(${currentInput})`;
        display.textContent = currentInput;
        break;
      case "1/x":
        currentInput = "1/(" + currentInput + ")";
        display.textContent = currentInput;
        break;
      case "n!":
        const n = parseInt(currentInput);
        currentInput = factorial(n).toString();
        display.textContent = currentInput;
        break;
      case "|x|":
        currentInput = `Math.abs(${currentInput})`;
        display.textContent = currentInput;
        break;
      case "log":
        currentInput = `Math.log10(${currentInput})`;
        display.textContent = currentInput;
        break;
      case "ln":
        currentInput = `Math.log(${currentInput})`;
        display.textContent = currentInput;
        break;
      case "exp":
        currentInput = `Math.exp(${currentInput})`;
        display.textContent = currentInput;
        break;
      case "10^x":
        currentInput = `Math.pow(10,${currentInput})`;
        display.textContent = currentInput;
        break;
      case "^":
        currentInput += "**";
        display.textContent = currentInput;
        break;
      default:
        // if (isDisplayClear) {
        //   display.textContent = "0";
        //   isDisplayClear = false;
        // } else {
        currentInput += value;
        display.textContent = currentInput;
      // }
    }
  });
});

const trigBtn = document.querySelectorAll(
  ".container-column.extra-funcions"
)[0];
const funcBtn = document.querySelectorAll(
  ".container-column.extra-funcions"
)[1];

const trigPanel = document.getElementById("trig-panel");
const funcPanel = document.getElementById("func-panel");

trigBtn.addEventListener("click", () => {
  trigPanel.classList.toggle("show-panel");
  funcPanel.classList.remove("show-panel");
});

funcBtn.addEventListener("click", () => {
  funcPanel.classList.toggle("show-panel");
  trigPanel.classList.remove("show-panel");
});

// Optional: click outside to close panels
document.addEventListener("click", (e) => {
  if (
    !e.target.closest(".container-column.extra-funcions") &&
    !e.target.closest(".function-panel")
  ) {
    trigPanel.classList.remove("show-panel");
    funcPanel.classList.remove("show-panel");
  }
});
