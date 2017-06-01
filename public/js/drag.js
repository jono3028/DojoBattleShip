// Array of final positions of ships, used to make game board
var shipPosition = [];
// target elements with the "draggable" class
interact('.draggable')
  .draggable({
    snap: {
      targets: [
        interact.createSnapGrid({ x: 50, y: 50 })
      ],
      range: Infinity,
      relativePoints: [ { x: 50, y: 50 } ]
    },
    // enable inertial throwing
    inertia: true,
    // keep the element within the area of it's parent
    restrict: {
      restriction: "parent",
      endOnly: true,
      elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
    },
    // enable autoScroll
    autoScroll: true,

    // call this function on every dragmove event
    onmove: (event) => {
      dragMoveListener(event)
    },
    // call this function on every dragend event
    onend: (event) => {
      var textEl = event.target.querySelector('p'),
      gridCords = getCords(event)

      textEl && (textEl.textContent =
        'Position: ' + gridCords[0] + '-' + gridCords[1]);
        // 'moved a distance of '
        // + (Math.sqrt(event.dx * event.dx +
        //              event.dy * event.dy)|0) + 'px');
    }
  });

  function dragMoveListener (event) {
    var target = event.target,
        // keep the dragged position in the data-x/data-y attributes
        x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
        y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
    // translate the element
    target.style.webkitTransform =
    target.style.transform =
      'translate(' + x + 'px, ' + y + 'px)';

    // update the posiion attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
  }

  // Get game board grid coordinates, returns Array [x-cord, y-cord]
  function getCords (event) {
    var lib = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'], // x-cord will display as alpha character
    target = event.target,
    vertOffset = parseFloat(target.getAttribute('shipNo')),
    gameX = lib[parseFloat(target.getAttribute('data-x'))/50],
    gameY = ((parseFloat(target.getAttribute('data-y')) + (50 * vertOffset)) / 50)
    shipPosition[vertOffset] = [gameX, gameY ]
    return shipPosition[vertOffset]
  }

  function save () {
    console.log(shipPosition);
  }
