// ── State ──────────────────────────────────────────────
let currentVal  = '0';
let storedVal   = null;
let operator    = null;
let shouldReset = false;   // próximo dígito inicia novo número

const elCurrent = document.getElementById('current');
const elHistory = document.getElementById('history');

// ── Render ─────────────────────────────────────────────
function render() {
  // Limita casas decimais na exibição para caber na tela
  let display = currentVal;
  if (display.length > 12) {
    const n = parseFloat(display);
    display = isNaN(n) ? 'Erro' : n.toPrecision(8).replace(/\.?0+$/, '');
  }
  elCurrent.textContent = display;
}

function flash() {
  elCurrent.classList.add('flash');
  setTimeout(() => elCurrent.classList.remove('flash'), 200);
}

// ── Entrada de dígitos ─────────────────────────────────
function input(digit) {
  if (shouldReset) {
    currentVal  = digit;
    shouldReset = false;
  } else {
    if (currentVal === '0' && digit !== '.') {
      currentVal = digit;
    } else if (currentVal.length < 12) {
      currentVal += digit;
    }
  }
  render();
}

function inputDot() {
  if (shouldReset) {
    currentVal  = '0.';
    shouldReset = false;
    render();
    return;
  }
  if (!currentVal.includes('.')) {
    currentVal += '.';
    render();
  }
}

// ── Operador ───────────────────────────────────────────
function setOp(op) {
  // se já havia operador pendente, resolve antes
  if (operator && !shouldReset) {
    calculate(true);
  }

  storedVal   = parseFloat(currentVal);
  operator    = op;
  shouldReset = true;

  const opSymbol = { '+': '+', '-': '−', '*': '×', '/': '÷' }[op];
  elHistory.textContent = `${format(storedVal)} ${opSymbol}`;
}

// ── Calcular ───────────────────────────────────────────
function calculate(silent = false) {
  if (operator === null || storedVal === null) return;

  const a = storedVal;
  const b = parseFloat(currentVal);
  let   result;

  switch (operator) {
    case '+': result = a + b; break;
    case '-': result = a - b; break;
    case '*': result = a * b; break;
    case '/':
      if (b === 0) { currentVal = 'Erro'; render(); reset(); return; }
      result = a / b;
      break;
  }

  if (!silent) {
    const opSymbol = { '+': '+', '-': '−', '*': '×', '/': '÷' }[operator];
    elHistory.textContent = `${format(a)} ${opSymbol} ${format(b)} =`;
    flash();
  }

  currentVal  = String(parseFloat(result.toPrecision(10)));
  operator    = null;
  storedVal   = null;
  shouldReset = true;
  render();
}

// ── Funções especiais ──────────────────────────────────
function clearAll() {
  currentVal  = '0';
  storedVal   = null;
  operator    = null;
  shouldReset = false;
  elHistory.textContent = '';
  render();
}

function toggleSign() {
  if (currentVal === '0' || currentVal === 'Erro') return;
  currentVal = currentVal.startsWith('-')
    ? currentVal.slice(1)
    : '-' + currentVal;
  render();
}

function percent() {
  const n = parseFloat(currentVal);
  if (isNaN(n)) return;
  currentVal = String(n / 100);
  render();
}

// ── Helper ─────────────────────────────────────────────
function format(n) {
  return parseFloat(n.toPrecision(8)).toString();
}

function reset() {
  operator    = null;
  storedVal   = null;
  shouldReset = true;
}

// ── Teclado físico ─────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key >= '0' && e.key <= '9') input(e.key);
  else if (e.key === '.')  inputDot();
  else if (e.key === '+')  setOp('+');
  else if (e.key === '-')  setOp('-');
  else if (e.key === '*')  setOp('*');
  else if (e.key === '/')  { e.preventDefault(); setOp('/'); }
  else if (e.key === 'Enter' || e.key === '=') calculate();
  else if (e.key === 'Escape') clearAll();
  else if (e.key === '%') percent();
  else if (e.key === 'Backspace') {
    if (currentVal.length > 1) currentVal = currentVal.slice(0, -1);
    else currentVal = '0';
    render();
  }
});