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

  // Close panels on other button clicks
  document.querySelectorAll(".button").forEach((btn) => {
    if (btn !== trigBtn && btn !== funcBtn) {
      btn.addEventListener("click", () => {
        hidePanel(trigPanel);
        hidePanel(funcPanel);
      });
    }
  });

  // Close panels when clicking outside
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
    this.oldBtnName = ["x²", "²√x", "xʸ", "10ˣ", "Log", "Ln"];
    this.newBtnName = ["x³", "³√x", "ʸ√x", "2ˣ", "logᵧx", "eˣ"];
    this.changeBtnName = document.querySelectorAll(".special");
  }

  updateDisplay(text = "") {
    this.displayEl.value = text;
  }
  updateHistory(text = "") {
    this.historyEl.textContent = text;
  }

  append(char) {
    const last = this.expression.slice(-1);
    if (/[+\-*/^.]/.test(last) && /[+\-*/^.]/.test(char)) {
      if (char !== last) {
        this.expression = this.expression.slice(0, -1) + char;
        this.updateDisplay(this.expression);
        return;
      }
      return;
    }
    if (char === "." && /\.\d*$/.test(this.expression)) return;
    if (char === "0" && this.displayEl.value === "") return;
    if (last === ")" && !/[+\-*/^.)%]/.test(char)) {
      // Check if the last pair of brackets is empty: look for '()' at the end
      if (this.expression.endsWith("()")) {
        this.expression = this.expression.slice(0, -2) + "(0)";
      }
      this.expression += "*";
    }

    this.expression += char;
    if (
      this.displayEl.value.includes("%") ||
      this.displayEl.value.includes("^")
    )
      this.updateDisplay(`${this.displayEl.value}${char}`);
    else this.updateDisplay(this.expression);
  }

  calcFact(num) {
    let ans = 1;
    while (num > 1) {
      ans *= num;
      num--;
    }
    return ans;
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
          this.expression = this.expression
            ? (this.expression += "**10")
            : "10**";
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
            this.changeBtnName.forEach((btn, i) => {
              btn.textContent = this.newBtnName[i];
            });
          } else {
            this.changeBtnName.forEach((btn, i) => {
              btn.textContent = this.oldBtnName[i];
            });
          }
          break;
        default:
          return;
      }
      if (!this.isChangeNames) {
        console.log(this.expression);
        this.updateHistory(`${fn} =`);
        this.expression = result.toString();
        this.lastResult = this.expression;
        this.updateDisplay(this.expression);
        this.ansShown = true;
        this.isChangeNames = false;
      }
    } catch (e) {
      this.updateHistory("ERROR");
      this.expression = "";
      this.updateDisplay("");
    }
  }

  compute() {
    try {
      console.log(this.expression);
      const result = eval(this.expression);
      console.log(result);
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
