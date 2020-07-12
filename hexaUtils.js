async function addHex({ name, toHexName, atBorderNo, queryModel, coordinatesModel }) {
  const collectionSize = await coordinatesModel.estimatedDocumentCount().exec();
  if (collectionSize === 0) {
    const newHex = { name: name, props: { coordinates: '0,0' } };
    await new queryModel({ name: newHex.name, props: newHex.props }).save();
    const { _doc: newCoordinates } = await new coordinatesModel({ coordinates: newHex.props.coordinates, name: newHex.name }).save();
    return {
      coordinates: newCoordinates.coordinates,
      name: newCoordinates.name,
    };
  }
  const existHex = await queryModel.findOne({ name }).exec();
  if (existHex) {
    return null;
  }
  const oldHex = await queryModel.findOne({ name: toHexName }).exec();
  if (oldHex) {
    const [q, r] = oldHex._doc.props.coordinates.split(',').map(c => Number(c)); // Get old hex coordinates

    const newCoordinates = getNewCoordinatesFrom(q, r, atBorderNo);
    const newHex = {
      coordinates: `${newCoordinates[0]},${newCoordinates[1]}`,
    };
    return await updateAllHexesBordersAround(newHex, name, true, queryModel, coordinatesModel);
  }
  return null;
}

// Get border of hex2 that connects to hex1's border (oldBorderNo)
function getNewHexBorderConnectedAt(oldBorderNo) {
  if (oldBorderNo < 3) {
    return oldBorderNo + 3;
  }
  return oldBorderNo - 3;
}

// Get coordinates of hex2 connecting to hex1 (with hex1 coordinates q, r) at borderNo of hex1
function getNewCoordinatesFrom(q, r, borderNo) {
  switch (borderNo) {
    case 0:
      return [q, r - 1];
    case 1:
      return [q + 1, r - 1];
    case 2:
      return [q + 1, r];
    case 3:
      return [q, r + 1];
    case 4:
      return [q - 1, r + 1];
    case 5:
      return [q - 1, r];
  }
}

async function searchHex(name, queryModel) {
  const hexFound = await queryModel.findOne({ name }).exec();
  return hexFound ? {
    name: hexFound._doc.name,
    props: hexFound._doc.props,
  } : null;
}

async function removeHex(name, queryModel, coordinatesModel) {
  // const hex = queryModel.get(name);
  const { _doc: { props: hex } } = await queryModel.findOne({ name }).exec();
  // Check if there are opposite hexes connected to ${hex} at ${hex}'s borders that are not consecutive
  const oppositeHexNames = isAbleToDisconnectGrids(hex);

  if (!oppositeHexNames) {  // Unable to disconnect grids -> Safe to remove
    return await updateAllHexesBordersAround(hex, name, false, queryModel, coordinatesModel);
  }

  // Find if there is a path from ${hexName1} to ${hexName2} to determine whether current ${hex} removal is safe or not
  const [hexName1, hexName2] = oppositeHexNames;

  if (await breadthFirstSearch(hexName1, hexName2, queryModel, name)) {
    return await updateAllHexesBordersAround(hex, name, false, queryModel, coordinatesModel);
  }
  return null;
}

function isAbleToDisconnectGrids(hexToRemove) {
  /*
           0
          ___
       5 /   \ 1 A
     C 4 \___/ 2
           3
           B
     hexToRemove = {
       1: 'A', // connect to hex A
       3: 'B', // connect to hex B
       4: 'C', // connect to hex C
     }
     => A is opposite to B & C and A is separated from B & C by nonconsecutive empty borders connections (2 and 5,0)
     => Removing this hex may disconnect the grids
   */
  /*
           0 A
          ___
       5 /   \ 1
     D 4 \___/ 2 B
           3
           C
     hexToRemove = {
       0: 'A', // connect to hex A
       2: 'B', // connect to hex B
       3: 'C', // connect to hex C
       4: 'D', // connect to hex D
     }
     => A is opposite to B, C & D and A is separated from B, C & D by nonconsecutive empty borders connections (1 and 5)
     => Removing this hex may disconnect the grids
   */
  /*
           0 A
          ___
       5 /   \ 1 B
       4 \___/ 2 C
           3
           D
     hexToRemove = {
       0: 'A', // connect to hex A
       1: 'B', // connect to hex B
       2: 'C', // connect to hex C
       3: 'D', // connect to hex D
     }
     => A, B, C & D are consecutive hexes connecting to current ${hexToRemove}
     => Removing this hex will NOT disconnect the grids => Safe to remove
   */
  // Opposite hexes connected to ${hexToRemove} at ${hexToRemove}'s borders that are not consecutive
  let oppositeHexNames = [];
  let isConsecutive;
  // Count the number of nonconsecutive empty border connections
  let count = 0;  // If count >= 2, chances are removing this hex will create the disconnected grids
  if (!hexToRemove[0]) {
    ++count;
    isConsecutive = true;
  } else {
    oppositeHexNames.push(hexToRemove[0]);
    isConsecutive = false
  }
  for (let border = 1; border < 6; ++border) {
    if (!hexToRemove[border] && !isConsecutive) {
      ++count;
      isConsecutive = true;
    } else if (hexToRemove[border] && isConsecutive) {
      oppositeHexNames.push(hexToRemove[border]);
      isConsecutive = false;
    }
  }
  // Removing this hex may disconnect the grids
  if (count >= 2 && oppositeHexNames.length >= 2) {
    return oppositeHexNames;
  }
  // It is safe to remove this hex
  return null;
}

async function breadthFirstSearch(hexName1, hexName2, queryModel, hexNameToRemove) {
  const queue = new Queue();
  const seen = new Set();

  queue.enqueue(hexName1);  // Add ${hexName1} as starting point
  seen.add(hexNameToRemove); // Do not touch the hex to be removed -> Find path assuming without this hex in the grid
  let currName, currHex;
  while (queue.length > 0) {
    currName = queue.dequeue();

    if (!seen.has(currName)) {
      seen.add(currName);
    }
    currHex = await queryModel.findOne({ name: currName }).exec();
    // Loop through all 6 hexes around ${currHex}
    for (let border = 0; border < 6; ++border) {
      // ${currHex} has a neighbor at ${border}
      if (currHex._doc.props[border]) {
        if (!seen.has(currHex._doc.props[border])) { // And current neighbor hasn't been seen
          queue.enqueue(currHex._doc.props[border]); // Add current neighbor's name to queue
        }
        if (currHex._doc.props[border] === hexName2) { // Found destination
          return true;
        }
      }
    }
  }
  return false;
}

async function updateAllHexesBordersAround(hex, name, isAdding, queryModel, coordinatesModel) {
  const [q, r] = hex.coordinates.split(',').map(c => Number(c));
  // Get all 6 hexes around current hex, and update their borders
  let existHex, existQ, existR, updatedExistHex;
  for (let border = 0; border < 6; ++border) {
    [existQ, existR] = getNewCoordinatesFrom(q, r, border);
    existHex = await coordinatesModel.findOne({ coordinates: `${existQ},${existR}` }).exec();
    if (existHex) {
      // Update the existing hex
      updatedExistHex = await queryModel.findOne({ name: existHex._doc.name }).exec();
      if (isAdding) {
        // Update existing hex connected to the new hex at opposite border to new hex's one
        updatedExistHex._doc.props[getNewHexBorderConnectedAt(border)] = name;
        // Update new hex connected to the existing hex above at current ${border}
        hex[border] = existHex._doc.name;
      } else {
        // Remove connections to the hex to be removed
        delete updatedExistHex._doc.props[getNewHexBorderConnectedAt(border)];
      }
      await queryModel.updateOne({ name: updatedExistHex._doc.name }, { props: updatedExistHex._doc.props }).exec();
    }
  }
  let hexResult;
  if (isAdding) {
    await new queryModel({ name, props: { ...hex } }).save();
    hexResult = await new coordinatesModel({ coordinates: hex.coordinates, name }).save();
    // queryModel.set(name, hex);
    // coordinatesModel.set(`${q},${r}`, name);
  } else {
    await queryModel.deleteOne({ name }).exec();
    hexResult = await coordinatesModel.deleteOne({ coordinates: hex.coordinates }).exec();
    // queryModel.delete(name);
    // coordinatesModel.delete(`${q},${r}`);
  }
  return {
    coordinates: hexResult._doc ? hexResult._doc.coordinates : hex.coordinates,
    name: hexResult._doc ? hexResult._doc.name : name,
  }
}

class Queue {
  constructor() {
    this.front = null;
    this.rear = null;
    this.length = 0;
  }

  enqueue(name) {
    const node = new QueueNode(name);
    if (!this.front) {
      this.front = this.rear = node;
    } else {
      this.rear.next = node;
      this.rear = node;
    }
    ++this.length;
  }

  dequeue() {
    if (!this.front) {
      return null;
    }
    const front = this.front;

    this.front = this.front.next;
    if (!this.front) {
      this.rear = null;
    }

    --this.length;

    return front.name;
  }
}

class QueueNode {
  constructor(name, next) {
    this.name = name || '';
    this.next = next || null;
  }
}

module.exports = {
  addHex,
  getNewHexBorderConnectedAt,
  getNewCoordinatesFrom,
  searchHex,
  removeHex,
  isAbleToDisconnectGrids,
  breadthFirstSearch,
  updateAllHexesBordersAround,
  Queue,
}
