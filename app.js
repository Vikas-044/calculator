window.addEventListener("DOMContentLoaded", () => {
  const trigBtn = document.getElementById("trig-btn");
  const funcBtn = document.getElementById("func-btn");
  const trigPanel = document.getElementById("trig-panel");
  const funcPanel = document.getElementById("func-panel");

  function showPanel(panel, btn) {
    const rect = btn.getBoundingClientRect();
    panel.style.left = `${rect.left + window.scrollX}px`;
    panel.style.top = `${rect.bottom + window.scrollY + 8}px`;
    panel.classList.remove("hidden");
  }

  function hidePanel(panel) {
    panel?.classList.add("hidden");
  }

  trigBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (trigPanel.classList.contains("hidden")) {
      showPanel(trigPanel, trigBtn);
      hidePanel(funcPanel);
    } else {
      hidePanel(trigPanel);
    }
  });

  funcBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (funcPanel.classList.contains("hidden")) {
      showPanel(funcPanel, funcBtn);
      hidePanel(trigPanel);
    } else {
      hidePanel(funcPanel);
    }
  });

  document.querySelectorAll(".button").forEach((btn) => {
    if (btn !== trigBtn && btn !== funcBtn) {
      btn.addEventListener("click", () => {
        hidePanel(trigPanel);
        hidePanel(funcPanel);
      });
    }
  });

  document.addEventListener("click", (e) => {
    if (
      !e.target.closest("#trig-panel") &&
      !e.target.closest("#func-panel") &&
      !e.target.closest("#trig-btn") &&
      !e.target.closest("#func-btn")
    ) {
      hidePanel(trigPanel);
      hidePanel(funcPanel);
    }
  });
});

class Calculator {
  constructor(displayEl, historyEl) {
    this.displayEl = displayEl;
    this.historyEl = historyEl;
    this.expression = "";
    this.lastResult = "";
    this.ansShown = false;
    this.isChangeNames = false;
    this.maxFact = 170;
    document.addEventListener("keydown", (e) => this.handleKey(e));
    this.oldBtnName = ["x²", "²√x", "xʸ", "10ˣ", "log", "ln"];
    this.newBtnName = ["x³", "³√x", "ʸ√x", "2ˣ", "logᵤx", "eˣ"];
    this.changeBtnName = document.querySelectorAll(".special");
    this.changeDegName = document.querySelector(".DEG");
    this.isRad = false;
  }

  updateDisplay(text = "") {
    this.displayEl.value = text;
  }
  updateHistory(text = "") {
    this.historyEl.textContent = text;
  }

  append(char) {
    const last = this.expression.slice(-1);
    if (/[+\-*/^\.]/.test(last) && /[+\-*/^\.]/.test(char)) {
      if (char !== last) {
        this.expression = this.expression.slice(0, -1) + char;
        this.updateDisplay(this.expression);
        return;
      }
      return;
    }

    if (char === "." && /\.\d*$/.test(this.expression)) return;
    if (char === "0" && this.displayEl.value === "") return;

    if (char === "(") {
      if (/[0-9%)πe]$/.test(last)) {
        this.expression += "*";
      }
      this.expression += "(";
    } else if (char === ")") {
      const openCount = (this.expression.match(/\(/g) || []).length;
      const closeCount = (this.expression.match(/\)/g) || []).length;
      if (openCount > closeCount) {
        if (this.expression.endsWith("()")) {
          this.expression = this.expression.slice(0, -2) + "(0)";
        } else {
          this.expression = this.expression.replace(/\(\)/g, "(0)");
        }
        this.expression += ")";
      }
    } else {
      if (last === ")" && !/[+\-*/^.)%]/.test(char)) {
        if (this.expression.endsWith("()")) {
          this.expression = this.expression.slice(0, -2) + "(0)";
        }
        this.expression += "*";
      }
      this.expression += char;
    }

    if (
      this.displayEl.value.includes("%") ||
      this.displayEl.value.includes("^")
    )
      this.updateDisplay(`${this.displayEl.value}${char}`);
    else this.updateDisplay(this.expression);
  }

  calcFact(num) {
    let ans = 1;
    while (num > 1) ans *= num--;
    return ans;
  }

  toRadians(deg) {
    return (deg * Math.PI) / 180;
  }

  applyFunction(func) {
    try {
      let fn;
      const val = this.expression
        ? eval(this.expression)
        : eval(this.lastResult);
      let result;
      switch (func) {
        case "±":
          result = -val;
          fn = "";
          break;
        case "%":
          this.updateDisplay(`${this.expression}%`);
          this.expression = `${val} * 0.01 *`;
          return;
        case "x²":
          result = val ** 2;
          fn = `${val}²`;
          break;
        case "1/x":
          result = 1 / val;
          fn = `1/${val}`;
          break;
        case "xʸ":
          this.updateDisplay(`${this.expression}^`);
          this.expression += "**";
          return;
        case "10ˣ":
          this.expression = this.expression ? this.expression + "**10" : "10**";
          this.updateDisplay(this.expression);
          return;
        case "|x|":
          result = Math.abs(val);
          fn = `|${val}|`;
          break;
        case "²√x":
          result = Math.sqrt(val);
          fn = `²√${val}`;
          break;
        case "ln":
          result = Math.log(val);
          fn = `ln(${val})`;
          break;
        case "log":
          result = Math.log10(val);
          fn = `log(${val})`;
          break;
        case "n!":
          if (val < 0 || val > this.maxFact) throw Error();
          result = this.calcFact(val);
          fn = `${val}!`;
          break;
        case "π":
          result = Math.PI;
          fn = "π";
          break;
        case "e":
          result = Math.E;
          fn = "e";
          break;
        case "2ⁿᵈ":
          this.isChangeNames = true;
          if (this.changeBtnName[0].textContent === "x²") {
            this.changeBtnName.forEach(
              (btn, i) => (btn.textContent = this.newBtnName[i])
            );
          } else {
            this.changeBtnName.forEach(
              (btn, i) => (btn.textContent = this.oldBtnName[i])
            );
          }
          return;
        case "DEG":
          this.changeDegName.textContent = "RAD";
          this.isRad = true;
          break;
        case "RAD":
          this.changeDegName.textContent = "DEG";
          this.isRad = false;
          break;
        case "sin": {
          const input = this.expression ? eval(this.expression) : 0;
          const angle = this.isRad ? input : this.toRadians(input);
          result = Math.sin(angle);
          fn = this.isRad ? `sin(${input}ᶜ)` : `sin(${input}°)`;
          break;
        }
        case "cos": {
          const input = this.expression ? eval(this.expression) : 0;
          const angle = this.isRad ? input : this.toRadians(input);
          result = Math.cos(angle);
          fn = this.isRad ? `cos(${input}ᶜ)` : `cos(${input}°)`;
          break;
        }
        case "tan": {
          const input = this.expression ? eval(this.expression) : 0;
          const angle = this.isRad ? input : this.toRadians(input);
          result = Math.tan(angle);
          fn = this.isRad ? `tan(${input}ᶜ)` : `tan(${input}°)`;
          break;
        }
        case "sinh": {
          const input = this.expression ? eval(this.expression) : 0;
          const angle = this.isRad ? input : this.toRadians(input);
          result = Math.sinh(angle);
          fn = this.isRad ? `sinh(${input}ᶜ)` : `sinh(${input}°)`;
          break;
        }
        case "cosh": {
          const input = this.expression ? eval(this.expression) : 0;
          const angle = this.isRad ? input : this.toRadians(input);
          result = Math.cosh(angle);
          fn = this.isRad ? `cosh(${input}ᶜ)` : `cosh(${input}°)`;
          break;
        }
        case "tanh": {
          const input = this.expression ? eval(this.expression) : 0;
          const angle = this.isRad ? input : this.toRadians(input);
          result = Math.tanh(angle);
          fn = this.isRad ? `tanh(${input}ᶜ)` : `tanh(${input}°)`;
          break;
        }
        case "⌈x⌉": {
          result = Math.ceil(val);
          fn = `⌈${val}⌉`;
          break;
        }
        case "⌊x⌋": {
          result = Math.floor(val);
          fn = `⌊${val}⌋`;
          break;
        }
        case "rand": {
          result = Math.random();
          fn = `rand`;
          break;
        }
        case "→dms": {
          const input = this.expression ? eval(this.expression) : 0;
          const degrees = Math.floor(input);
          const minutesFloat = (input - degrees) * 60;
          const minutes = Math.floor(minutesFloat);
          const seconds = ((minutesFloat - minutes) * 60).toFixed(2);

          result = `${degrees}° ${minutes}' ${seconds}"`;
          fn = `dms(${input})`;
          break;
        }
        case "x³": {
          result = val ** 3;
          fn = `${val}³`;
          break;
        }
        case "³√x":
          result = Math.cbrt(val);
          fn = `³√${val}`;
          break;
        case "ʸ√x": {
          // Store current base (x)
          const base = this.expression ? eval(this.expression) : 0;
          this.memoryValue = base; // temporarily hold base

          // Reset expression to accept new y input (root degree)
          this.expression = "";
          this.fn = `ʸ√(${base}, ?)`;
          this.updateDisplay(`ʸ√(${base}, )`);
          return;
        }
        case "2ˣ":
          this.expression = this.expression ? this.expression + "**2" : "2**";
          this.updateDisplay(this.expression);
          return;
        case "eˣ":
          this.expression = this.expression
            ? this.expression + `**${Math.E}`
            : `${Math.E}**`;
          this.updateDisplay(this.expression);
          return;
        case "logᵤx": {
          const input = this.expression ? eval(this.expression) : 0;

          if (this.memoryFunction === "logᵤx") {
            // Second step: user has entered base u
            const u = input;
            const x = this.memoryValue;
            if (x <= 0 || u <= 0 || u === 1)
              throw Error("Invalid input for logᵤx");
            result = Math.log(x) / Math.log(u);
            fn = `log base ${u} of ${x}`;
            delete this.memoryFunction;
            delete this.memoryValue;
          } else {
            // First step: user enters x
            this.memoryFunction = "logᵤx";
            this.memoryValue = input;
            this.expression = "";
            this.fn = `logᵤ(${input}, ?)`;
            this.updateDisplay(`logᵤ(${input}, )`);
            return;
          }
          break;
        }

        default:
          return;
      }

      // if (!this.isChangeNames) {
      this.updateHistory(`${fn} =`);
      this.expression = result.toString();
      this.lastResult = this.expression;
      this.updateDisplay(this.expression);
      this.ansShown = true;
      this.isChangeNames = false;
      // }
    } catch (e) {
      this.updateHistory("ERROR");
      this.expression = "";
      this.updateDisplay("");
    }
  }

  compute() {
    try {
      const result = eval(this.expression);
      this.updateHistory(`${this.expression} = `);
      this.expression = result;
      this.lastResult = this.expression;
      this.updateDisplay(this.expression);
      this.ansShown = true;
    } catch (e) {
      this.updateHistory("ERROR");
      this.expression = "";
      this.updateDisplay("");
    }
  }

  handleButton(btn) {
    const text = btn.textContent;
    if (btn.classList.contains("digits") || text === ".") {
      if (this.ansShown) {
        this.updateHistory(`Ans = ${this.expression}`);
        this.expression = "";
        this.ansShown = false;
      }
      this.append(text);
    } else if (btn.classList.contains("operator")) {
      if (this.ansShown) {
        this.expression = this.displayEl.value;
        this.ansShown = false;
      }
      this.append(text);
    } else if (btn.classList.contains("func")) {
      this.applyFunction(text);
    } else if (btn.classList.contains("clear-one")) {
      this.expression = this.expression.slice(0, -1);
      this.updateDisplay(this.expression);
    } else if (btn.classList.contains("clear-all")) {
      this.ansShown = false;
      this.expression = "";
      this.lastResult = "";
      this.updateDisplay(this.expression);
      this.updateHistory("ALL CLEARED");
    } else if (btn.classList.contains("equal")) {
      if (this.expression.slice(-1) === "*") this.expression += "1";
      this.compute();
    } else if (btn.classList.contains("changeNames")) {
      this.applyFunction(text);
    } else if (btn.classList.contains("DEG")) {
      this.applyFunction(text);
    } else if (btn.classList.contains("popup-btn")) {
      this.applyFunction(text);
    }
  }

  handleKey(e) {
    const keyMap = {
      Enter: "equal",
      Backspace: "clear-one",
      Escape: "clear-all",
      "+": "+",
      "-": "-",
      "*": "*",
      "/": "/",
      ".": ".",
      "%": "%",
      "(": "(",
      ")": ")",
    };
    if (keyMap[e.key]) {
      if (keyMap[e.key].includes("equal")) this.compute();
      else if (keyMap[e.key].includes("clear-one"))
        (this.expression = this.expression.slice(0, -1)),
          this.updateDisplay(this.expression);
      else if (keyMap[e.key].includes("clear-all"))
        (this.expression = ""),
          this.updateDisplay(""),
          this.updateHistory("ALL CLEARED");
      else this.append(keyMap[e.key]);
      e.preventDefault();
    } else if (/\d/.test(e.key)) this.append(e.key), e.preventDefault();
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const display = document.getElementById("display");
  const history = document.querySelector(".history-item-text");
  const calc = new Calculator(display, history);
  document
    .querySelectorAll(".button")
    .forEach((btn) =>
      btn.addEventListener("click", () => calc.handleButton(btn))
    );
});
