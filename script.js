const database = {
  'MG': 'Prefix of our company, Magic World',
  '65': 'Is the size in inches',
  'V': 'Means the TV is part of the V-Series',
  '24': 'Refers to the "Frameless" feature',
  'U': 'Refers to the 4K UHD resolution',
  'S': 'Refers to the "Smart" feature',
  'B': 'Unassigned',
  'T2': 'Means the TV has a built-in DVB-S2/T2 receiver',
  '14': 'Refers to the OS, being Android 14'
};

function explain(model) {
  const command = document.getElementById('command');
  const explanations = document.getElementById('explanations');
  const linesSvg = document.getElementById('lines');

  command.innerHTML = '';
  explanations.innerHTML = '';
  linesSvg.innerHTML = '';

  const parts = model.replace(/\//g, ' ').match(/[A-Za-z]+\d+|\d+|[A-Za-z]+/g) || [];
  const spans = [];
  parts.forEach((part, idx) => {
    const span = document.createElement('span');
    span.textContent = part;
    span.dataset.index = idx;
    span.className = 'token';
    command.appendChild(span);
    command.appendChild(document.createTextNode(' '));

    const box = document.createElement('div');
    box.className = 'explanation';
    box.textContent = database[part] || 'Unknown segment';
    box.dataset.index = idx;
    explanations.appendChild(box);
    spans.push({span, box});
  });

  // draw lines with unique lanes and 90deg bends
  let lane = 0;
  spans.forEach(({span, box}, idx) => {
    const spanRect = span.getBoundingClientRect();
    const boxRect = box.getBoundingClientRect();
    const containerRect = command.getBoundingClientRect();

    const x1 = spanRect.right - containerRect.left;
    const y1 = spanRect.top + spanRect.height / 2 - containerRect.top;
    const x2 = boxRect.left - containerRect.left;
    const y2 = boxRect.top + boxRect.height / 2 - containerRect.top;

    lane = Math.max(lane + 30, y1, y2);

    const d = [
      `M${x1},${y1}`,
      `H${x1 + 20}`,
      `V${lane}`,
      `H${x2 - 20}`,
      `V${y2}`,
      `H${x2}`
    ].join(' ');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('stroke', `hsl(${idx * 40},70%,50%)`);
    linesSvg.appendChild(path);
  });

  // interactive highlight
  spans.forEach(({span, box}) => {
    span.addEventListener('mouseover', () => highlight(span, box, true));
    span.addEventListener('mouseout', () => highlight(span, box, false));
    box.addEventListener('mouseover', () => highlight(span, box, true));
    box.addEventListener('mouseout', () => highlight(span, box, false));
  });
}

function highlight(span, box, on) {
  if (on) {
    span.classList.add('active');
    box.classList.add('active');
  } else {
    span.classList.remove('active');
    box.classList.remove('active');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('explain-btn').addEventListener('click', () => {
    const model = document.getElementById('model').value.trim();
    explain(model);
  });
  explain(document.getElementById('model').value.trim());
});
