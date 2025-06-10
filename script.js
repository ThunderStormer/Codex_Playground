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

  const parts = model
    .replace(/\//g, ' ')
    .match(/[A-Za-z]+\d+|\d+|[A-Za-z]+/g) || [];
  const spans = [];
  const leftIndices = [];
  const rightIndices = [];
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

    if (idx % 2 === 0) {
      leftIndices.push(idx);
    } else {
      rightIndices.push(idx);
    }
  });

  // adjust widths
  const canvasEl = document.getElementById('canvas');
  const containerRect = canvasEl.getBoundingClientRect();
  const halfWidth = containerRect.width / 2;
  command.style.width = 'auto';
  const contentWidth = command.scrollWidth;
  const targetWidth = contentWidth > halfWidth ? contentWidth + 20 : halfWidth;
  command.style.width = `${targetWidth}px`;
  document.querySelectorAll('.explanation').forEach((box) => {
    box.style.width = `${targetWidth}px`;
  });

  // draw connector lines with 90-degree bends
  const leftPad = parseFloat(getComputedStyle(canvasEl).paddingLeft) || 0;
  const rightPad = parseFloat(getComputedStyle(canvasEl).paddingRight) || 0;
  linesSvg.setAttribute('width', containerRect.width);
  linesSvg.setAttribute('height', containerRect.height);
  linesSvg.setAttribute('viewBox', `0 0 ${containerRect.width} ${containerRect.height}`);

  const leftSpacing = leftPad / (leftIndices.length + 1);
  const rightSpacing = rightPad / (rightIndices.length + 1);

  spans.forEach(({ span, box }, idx) => {
    const spanRect = span.getBoundingClientRect();
    const boxRect = box.getBoundingClientRect();

    const startX = spanRect.left + spanRect.width / 2 - containerRect.left;
    const startY = spanRect.bottom - containerRect.top;
    const endY = boxRect.top + boxRect.height / 2 - containerRect.top;
    const attachLeft = idx % 2 === 0;

    const endX = attachLeft
      ? boxRect.left - containerRect.left
      : boxRect.right - containerRect.left;

    let laneIndex, laneX, startBreak;
    if (attachLeft) {
      laneIndex = leftIndices.indexOf(idx) + 1;
      laneX = leftSpacing * laneIndex;
      startBreak = startY + 20 + laneIndex * 10;
    } else {
      laneIndex = rightIndices.indexOf(idx) + 1;
      laneX = containerRect.width - rightPad + rightSpacing * laneIndex;
      startBreak = startY + 20 + laneIndex * 10;
    }

    const d =
      `M ${startX} ${startY}` +
      ` L ${startX} ${startBreak}` +
      ` L ${laneX} ${startBreak}` +
      ` L ${laneX} ${endY}` +
      ` L ${endX} ${endY}`;

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
