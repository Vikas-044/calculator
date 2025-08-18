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
  constructor(displayEl, historyEl, memoryDisplayEl) {
    this.displayEl = displayEl;
    this.historyEl = historyEl;
    this.memoryDisplayEl = memoryDisplayEl;
    this.expression = "0";
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
    this.logBaseMode = false;
    this.rootBaseMode = false;
    this.isDec = false;
    this.memoryVal = "";
    this.tempExpression = "";
  }

  updateDisplay(text = "") {
    if (text.length > 32) return;
    this.displayEl.value = text;
  }

  updateHistory(text = "") {
    this.historyEl.textContent = text;
  }

  updateMemory(text = "") {
    this.memoryDisplayEl.textContent = text;
  }

  getSafeExpression() {
    return this.expression === "" ? "0" : this.expression;
  }

  append(char) {
    if (this.ansShown) {
      this.updateHistory(`Ans = ${this.expression}`);
      this.expression = "";
      this.ansShown = false;
    }

    const last = this.expression.slice(-1);

    if (/[+\-*/^\.]/.test(last) && /[+\-*/^\.]/.test(char)) {
      if (char !== last) {
        this.expression = this.expression.slice(0, -1) + char;
        if (char === "." && this.expression.includes(".")) return;
        this.updateDisplay(this.expression);
        return;
      }
      return;
    }

    if (char === "." && /\.\d*$/.test(this.expression)) return;
    if (char === "0" && this.displayEl.value === "0") return;
    if (char === "." && this.displayEl.value === "") this.expression += "0";

    if (this.logBaseMode) {
      this.tempExpression += char;
      this.updateDisplay(`log(${this.memoryValue}, ${this.tempExpression})`);
      return;
    }

    if (this.rootBaseMode) {
      this.tempExpression += char;
      this.updateDisplay(`ʸ√(${this.memoryValue}, ${this.tempExpression})`);
      return;
    }

    if (char === "(") {
      if (/[0-9%)πe]$/.test(last)) this.expression += "*";
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
      const safeExpr = this.getSafeExpression();
      const val = eval(safeExpr);
      let result;

      switch (func) {
        case "±":
          result = -val;
          fn = "";
          break;
        case "%":
          this.updateDisplay(`${safeExpr}%`);
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
          this.updateDisplay(`${safeExpr}^`);
          this.expression += "**";
          return;
        case "10ˣ":
          result = 10 ** val;
          fn = `10^${val}`;
          break;
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
          const btnText = this.changeBtnName[0].textContent;
          const swap = btnText === "x²" ? this.newBtnName : this.oldBtnName;
          this.changeBtnName.forEach((btn, i) => (btn.textContent = swap[i]));
          return;
        case "DEG":
        case "RAD":
          this.isRad = !this.isRad;
          this.changeDegName.textContent = this.isRad ? "RAD" : "DEG";
          return;
        case "sin":
        case "cos":
        case "tan":
        case "sinh":
        case "cosh":
        case "tanh": {
          const angle = this.isRad ? val : this.toRadians(val);
          result = Math[func](angle);
          fn = `${func}(${val}${this.isRad ? "ᶜ" : "°"})`;
          break;
        }
        case "⌈x⌉":
          result = Math.ceil(val);
          fn = `⌈${val}⌉`;
          break;
        case "⌊x⌋":
          result = Math.floor(val);
          fn = `⌊${val}⌋`;
          break;
        case "rand":
          result = Math.random();
          fn = `rand`;
          break;
        case "→dms": {
          const degrees = Math.floor(val);
          const minutesFloat = (val - degrees) * 60;
          const minutes = Math.floor(minutesFloat);
          const seconds = ((minutesFloat - minutes) * 60).toFixed(2);
          result = `${degrees}° ${minutes}' ${seconds}"`;
          fn = `dms(${val})`;
          break;
        }
        case "x³":
          result = val ** 3;
          fn = `${val}³`;
          break;
        case "³√x":
          result = Math.cbrt(val);
          fn = `³√${val}`;
          break;
        case "ʸ√x":
          this.memoryValue = val;
          this.expression = "";
          this.tempExpression = "";
          this.fn = `ʸ√(${val}, ?)`;
          this.updateDisplay(`ʸ√(${val}, )`);
          this.rootBaseMode = true;
          return;
        case "2ˣ":
          result = 2 ** val;
          fn = `2^${val}`;
          break;
        case "eˣ":
          this.expression = `${Math.E}**`;
          this.updateDisplay(this.expression);
          return;
        case "logᵤx":
          this.memoryValue = val;
          this.expression = "";
          this.tempExpression = "";
          this.fn = `log(${val}, ?)`;
          this.updateDisplay(`log(${val}, )`);
          this.logBaseMode = true;
          return;
        case "F-E":
          const disContent = Number(this.displayEl.value);
          const newDisplay = this.isDec
            ? disContent.toExponential()
            : disContent;
          this.isDec = !this.isDec;
          this.updateDisplay(newDisplay.toString());
          return;
        case "MC":
          this.memoryVal = "0";
          this.updateMemory(this.memoryVal);
          return;
        case "MR":
          this.updateDisplay(this.memoryVal);
          return;
        case "M+":
          if (isFinite(this.displayEl.value))
            this.memoryVal = (
              Number(this.memoryVal) + Number(this.displayEl.value)
            ).toString();
          this.updateMemory(this.memoryVal);
          return;
        case "M-":
          if (isFinite(this.displayEl.value))
            this.memoryVal = (
              Number(this.memoryVal) - Number(this.displayEl.value)
            ).toString();
          this.updateMemory(this.memoryVal);
          return;
        case "MS":
          if (isFinite(this.displayEl.value))
            this.memoryVal = this.displayEl.value;
          this.updateMemory(this.memoryVal);
          return;
        default:
          return;
      }

      this.updateHistory(`${fn} =`);
      this.expression = result.toString();
      this.lastResult = this.expression;
      this.updateDisplay(this.expression);
      this.ansShown = true;
      this.isChangeNames = false;
    } catch (e) {
      this.updateHistory("ERROR");
      this.expression = "";
      this.updateDisplay("");
    }
  }

  compute() {
    try {
      const expr = this.getSafeExpression();
      let result;
      if (this.logBaseMode) {
        result =
          Math.log(Number(this.tempExpression)) /
          Math.log(Number(this.memoryValue));
        this.updateHistory(
          `log(${this.memoryValue}, ${this.tempExpression}) =`
        );
        this.logBaseMode = false;
      } else if (this.rootBaseMode) {
        result = Number(this.tempExpression) ** (1 / Number(this.memoryValue));
        this.updateHistory(`ʸ√(${this.memoryValue}, ${this.tempExpression}) =`);
        this.rootBaseMode = false;
      } else {
        if (expr.includes("/0") || expr.includes("/(0"))
          throw new Error("Cannot Divide By Zero");
        result = eval(expr);
        this.updateHistory(`${expr} =`);
      }
      this.expression = result.toString();
      this.lastResult = this.expression;
      this.updateDisplay(this.expression);
      this.tempExpression = "";
      this.ansShown = true;
    } catch (e) {
      this.updateHistory("ERROR");
      this.expression = "";
      this.updateDisplay("");
    }
  }

  handleButton(btn) {
    const text = btn.textContent;
    if (btn.classList.contains("digits") || text === ".") this.append(text);
    else if (btn.classList.contains("operator")) this.append(text);
    else if (btn.classList.contains("func")) this.applyFunction(text);
    else if (btn.classList.contains("clear-one")) {
      this.expression = this.expression.slice(0, -1);
      this.updateDisplay(this.expression || "0");
    } else if (btn.classList.contains("clear-all")) {
      this.ansShown = false;
      this.expression = "";
      this.lastResult = "";
      this.updateDisplay("0");
      this.updateHistory("ALL CLEARED");
    } else if (btn.classList.contains("equal")) {
      if (this.expression.slice(-1) === "*") this.expression += "1";
      this.compute();
    } else if (
      btn.classList.contains("changeNames") ||
      btn.classList.contains("DEG") ||
      btn.classList.contains("popup-btn") ||
      btn.classList.contains("F-E") ||
      btn.classList.contains("memory")
    ) {
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
      if (keyMap[e.key] === "equal") this.compute();
      else if (keyMap[e.key] === "clear-one") {
        this.expression = this.expression.slice(0, -1);
        this.updateDisplay(this.expression || "0");
      } else if (keyMap[e.key] === "clear-all") {
        this.expression = "0";
        this.updateDisplay("0");
        this.updateHistory("ALL CLEARED");
      } else this.append(keyMap[e.key]);
      e.preventDefault();
    } else if (/\d/.test(e.key)) this.append(e.key), e.preventDefault();
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const display = document.getElementById("display");
  const history = document.querySelector(".history-item-text");
  const memoryDisplayEl = document.querySelector(".memory-item-text");
  const calc = new Calculator(display, history, memoryDisplayEl);
  document
    .querySelectorAll(".button")
    .forEach((btn) =>
      btn.addEventListener("click", () => calc.handleButton(btn))
    );
});
