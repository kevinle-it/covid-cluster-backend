const { describe, test, expect } = require('@jest/globals');
const {
  addHex,
  getNewHexBorderConnectedAt,
  getNewCoordinatesFrom,
  searchHex,
  removeHex,
  isAbleToDisconnectGrids,
  breadthFirstSearch,
  updateAllHexesBordersAround,
  Queue,
} = require('./hexaUtils.mongoDbVersion');

describe('Test hex util function: getNewHexBorderConnectedAt()', () => {
  test('Get border of hex2 that connects to hex1\'s border', () => {
    let hex2Border;
    for (let hex1Border = 0; hex1Border < 6; ++hex1Border) {
      hex2Border = getNewHexBorderConnectedAt(hex1Border);
      switch (hex1Border) {
        case 0:
          expect(hex2Border).toBe(3);
          break;
        case 1:
          expect(hex2Border).toBe(4);
          break;
        case 2:
          expect(hex2Border).toBe(5);
          break;
        case 3:
          expect(hex2Border).toBe(0);
          break;
        case 4:
          expect(hex2Border).toBe(1);
          break;
        case 5:
          expect(hex2Border).toBe(2);
          break;
      }
    }
  });
});

describe('Test hex util function: getNewCoordinatesFrom()', () => {
  test('Get coordinates of hex2 connecting to hex1 (with hex1 coordinates [0, 0]) at all 6 borders of hex1', () => {
    let [hex1Q, hex1R] = [0, 0], hex2Coords;
    for (let hex1Border = 0; hex1Border < 6; ++hex1Border) {
      // hex1 [q, r] = [0, 0]
      hex2Coords = getNewCoordinatesFrom(hex1Q, hex1R, hex1Border);
      switch (hex1Border) {
        case 0:
          expect(hex2Coords).toEqual([0, -1]);
          break;
        case 1:
          expect(hex2Coords).toEqual([1, -1]);
          break;
        case 2:
          expect(hex2Coords).toEqual([1, 0]);
          break;
        case 3:
          expect(hex2Coords).toEqual([0, 1]);
          break;
        case 4:
          expect(hex2Coords).toEqual([-1, 1]);
          break;
        case 5:
          expect(hex2Coords).toEqual([-1, 0]);
          break;
      }
    }
  });
  test('Get coordinates of hex2 connecting to hex1 (with hex1 coordinates [-4, 2]) at all 6 borders of hex1', () => {
    let [hex1Q, hex1R] = [-4, 2], hex2Coords;
    for (let hex1Border = 0; hex1Border < 6; ++hex1Border) {
      // hex1 [q, r] = [-4, 2]
      hex2Coords = getNewCoordinatesFrom(hex1Q, hex1R, hex1Border);
      switch (hex1Border) {
        case 0:
          expect(hex2Coords).toEqual([-4, 1]);
          break;
        case 1:
          expect(hex2Coords).toEqual([-3, 1]);
          break;
        case 2:
          expect(hex2Coords).toEqual([-3, 2]);
          break;
        case 3:
          expect(hex2Coords).toEqual([-4, 3]);
          break;
        case 4:
          expect(hex2Coords).toEqual([-5, 3]);
          break;
        case 5:
          expect(hex2Coords).toEqual([-5, 2]);
          break;
      }
    }
  });
  test('Get coordinates of hex2 connecting to hex1 (with random hex1 coordinates q, r) at all 6 borders of hex1', () => {
    let min = -1000;
    let max = 1000;
    let hex1Q = Math.floor(Math.random() * (max - min + 1)) + min;
    let hex1R = Math.floor(Math.random() * (max - min + 1)) + min;
    let hex2Coords;
    for (let hex1Border = 0; hex1Border < 6; ++hex1Border) {
      hex2Coords = getNewCoordinatesFrom(hex1Q, hex1R, hex1Border);
      switch (hex1Border) {
        case 0:
          expect(hex2Coords).toEqual([hex1Q, hex1R - 1]);
          break;
        case 1:
          expect(hex2Coords).toEqual([hex1Q + 1, hex1R - 1]);
          break;
        case 2:
          expect(hex2Coords).toEqual([hex1Q + 1, hex1R]);
          break;
        case 3:
          expect(hex2Coords).toEqual([hex1Q, hex1R + 1]);
          break;
        case 4:
          expect(hex2Coords).toEqual([hex1Q - 1, hex1R + 1]);
          break;
        case 5:
          expect(hex2Coords).toEqual([hex1Q - 1, hex1R]);
          break;
      }
    }
  });
});

describe('Test hex util function: isAbleToDisconnectGrids()', () => {
  test('Remove hex = { 0: A, 2: B, 3: C } may disconnect the grids', () => {
    /*
              0 A
             ___
          5 /   \ 1
          4 \___/ 2 B
              3
              C
      hexToRemove = {
      0: 'A', // connect to hex A
      2: 'B', // connect to hex B
      3: 'C', // connect to hex C
      }
      => A is opposite to B & C and A is separated from B & C by nonconsecutive empty borders connections (1 and 4,5)
      => Removing this hex may disconnect the grids
     */
    const hexToRemove = { 0: 'A', 2: 'B', 3: 'C' };
    const oppositeHexNames = isAbleToDisconnectGrids(hexToRemove);
    expect(oppositeHexNames).toEqual(['A', 'B']);
  });
  test('Remove hex = { 1: A, 3: B, 4: C } may disconnect the grids', () => {
    const hexToRemove = { 1: 'A', 3: 'B', 4: 'C' };
    const oppositeHexNames = isAbleToDisconnectGrids(hexToRemove);
    expect(oppositeHexNames).toEqual(['A', 'B']);
  });
  test('Remove hex = { 0: A, 2: B, 3: C, 5: D } may disconnect the grids', () => {
    const hexToRemove = { 0: 'A', 2: 'B', 3: 'C', 5: 'D' };
    const oppositeHexNames = isAbleToDisconnectGrids(hexToRemove);
    expect(oppositeHexNames).toEqual(['A', 'B', 'D']);
  });
  test('Remove hex = { 1: A, 2: B, 3: C, 5: D } may disconnect the grids', () => {
    const hexToRemove = { 1: 'A', 2: 'B', 3: 'C', 5: 'D' };
    const oppositeHexNames = isAbleToDisconnectGrids(hexToRemove);
    expect(oppositeHexNames).toEqual(['A', 'D']);
  });

  test('Removing hex = { 0: A, 1: B, 2: C } will NOT disconnect the grids => Safe to remove', () => {
    const hexToRemove = { 0: 'A', 1: 'B', 2: 'C' };
    const oppositeHexNames = isAbleToDisconnectGrids(hexToRemove);
    expect(oppositeHexNames).toBe(null);
  });
  test('Removing hex = { 2: A, 3: B, 4: C } will NOT disconnect the grids => Safe to remove', () => {
    const hexToRemove = { 2: 'A', 3: 'B', 4: 'C' };
    const oppositeHexNames = isAbleToDisconnectGrids(hexToRemove);
    expect(oppositeHexNames).toBe(null);
  });
  test('Removing hex = { 0: A, 1: B, 2: C, 3: D } will NOT disconnect the grids => Safe to remove', () => {
    const hexToRemove = { 0: 'A', 1: 'B', 2: 'C', 3: 'D' };
    const oppositeHexNames = isAbleToDisconnectGrids(hexToRemove);
    expect(oppositeHexNames).toBe(null);
  });
  test('Removing hex = { 0: A, 3: B, 4: C, 5: D } will NOT disconnect the grids => Safe to remove', () => {
    const hexToRemove = { 0: 'A', 3: 'B', 4: 'C', 5: 'D' };
    const oppositeHexNames = isAbleToDisconnectGrids(hexToRemove);
    expect(oppositeHexNames).toBe(null);
  });
  test('Removing hex = { 1: A, 2: B, 3: C, 4: D } will NOT disconnect the grids => Safe to remove', () => {
    const hexToRemove = { 1: 'A', 2: 'B', 3: 'C', 4: 'D' };
    const oppositeHexNames = isAbleToDisconnectGrids(hexToRemove);
    expect(oppositeHexNames).toBe(null);
  });
  test('Removing hex = { 2: A, 3: B, 4: C, 5: D } will NOT disconnect the grids => Safe to remove', () => {
    const hexToRemove = { 2: 'A', 3: 'B', 4: 'C', 5: 'D' };
    const oppositeHexNames = isAbleToDisconnectGrids(hexToRemove);
    expect(oppositeHexNames).toBe(null);
  });
  test('Remove hex = { 0: A, 2: B, 3: C, 4: D, 5: E } will NOT disconnect the grids => Safe to remove', () => {
    const hexToRemove = { 0: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'E' };
    const oppositeHexNames = isAbleToDisconnectGrids(hexToRemove);
    expect(oppositeHexNames).toEqual(null);
  });
  test('Removing hex = { 1: A, 2: B, 3: C, 4: D, 5: E } will NOT disconnect the grids => Safe to remove', () => {
    const hexToRemove = { 1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'E' };
    const oppositeHexNames = isAbleToDisconnectGrids(hexToRemove);
    expect(oppositeHexNames).toBe(null);
  });
  test('Removing hex = { 0: A, 1: B, 2: C, 3: D, 4: E, 5: F } will NOT disconnect the grids => Safe to remove', () => {
    const hexToRemove = { 0: 'A', 1: 'B', 2: 'C', 3: 'D', 4: 'E', 5: 'F' };
    const oppositeHexNames = isAbleToDisconnectGrids(hexToRemove);
    expect(oppositeHexNames).toBe(null);
  });
});

const setUpForAdding = () => {
  /*
                 ___       ___
                / a \     / e \
                \___/     \___/
                / b \ ___ / d \
                \___// c \\___/
                     \___/
    a (0,0); b(0,1); c(1,1); d(2,0); e(2,-1)
   */
  const hexA = {
    name: 'a',
    props: { 3: 'b', coordinates: '0,0' },
  };
  const hexB = {
    name: 'b',
    props: { 0: 'a', 2: 'c', coordinates: '0,1' },
  };
  const hexC = {
    name: 'c',
    props: { 1: 'd', 5: 'b', coordinates: '1,1' },
  };
  const hexD = {
    name: 'd',
    props: { 0: 'e', 4: 'c', coordinates: '2,0' },
  };
  const hexE = {
    name: 'e',
    props: { 3: 'd', coordinates: '2,-1' },
  };
  const queryMap = new Map();
  queryMap.set(hexA.name, hexA.props);
  queryMap.set(hexB.name, hexB.props);
  queryMap.set(hexC.name, hexC.props);
  queryMap.set(hexD.name, hexD.props);
  queryMap.set(hexE.name, hexE.props);

  const coordinatesMap = new Map();
  coordinatesMap.set(hexA.props.coordinates, hexA.name);
  coordinatesMap.set(hexB.props.coordinates, hexB.name);
  coordinatesMap.set(hexC.props.coordinates, hexC.name);
  coordinatesMap.set(hexD.props.coordinates, hexD.name);
  coordinatesMap.set(hexE.props.coordinates, hexE.name);

  return {
    queryMap,
    coordinatesMap,
  }
};
const setUpForRemoving = (hexFPosition = 1) => {
  const { queryMap, coordinatesMap } = setUpForAdding();
  /*
    Add hex F at position 1 or 2 to test removing F at either position
                              ___
                         ___ /f1 \ ___
                        / a \\___// e \
                        \___//f2 \\___/
                        / b \\___// d \
                        \___// c \\___/
                             \___/
    a (0,0); b(0,1); c(1,1); d(2,0); e(2,-1); f1(1,-1); f2(1,0)
   */
  const hexA = {
    name: 'a',
    props: { 1: 'f', 3: 'b', coordinates: '0,0' },
  };
  const hexE = {
    name: 'e',
    props: { 3: 'd', 5: 'f', coordinates: '2,-1' },
  };
  const hexF = {
    name: 'f',
    props: { 2: 'e', 4: 'a', coordinates: '1,-1' },
  };
  if (hexFPosition === 2) {
    const hexB = {
      name: 'b',
      props: { 0: 'a', 1: 'f', 2: 'c', coordinates: '0,1' },
    };
    const hexC = {
      name: 'c',
      props: { 0: 'f', 1: 'd', 5: 'b', coordinates: '1,1' },
    };
    const hexD = {
      name: 'd',
      props: { 0: 'e', 4: 'c', 5: 'f', coordinates: '2,0' },
    };
    queryMap.set(hexB.name, hexB.props);
    queryMap.set(hexC.name, hexC.props);
    queryMap.set(hexD.name, hexD.props);

    coordinatesMap.set(hexB.props.coordinates, hexB.name);
    coordinatesMap.set(hexC.props.coordinates, hexC.name);
    coordinatesMap.set(hexD.props.coordinates, hexD.name);

    hexA.props = { 2: 'f', 3: 'b', coordinates: '0,0' };
    hexE.props = { 3: 'd', 4: 'f', coordinates: '2,-1' };
    hexF.props = { 1: 'e', 2: 'd', 3: 'c', 4: 'b', 5: 'a', coordinates: '1,0' };
  }
  queryMap.set(hexA.name, hexA.props);
  queryMap.set(hexE.name, hexE.props);
  queryMap.set(hexF.name, hexF.props);

  coordinatesMap.set(hexA.props.coordinates, hexA.name);
  coordinatesMap.set(hexE.props.coordinates, hexE.name);
  coordinatesMap.set(hexF.props.coordinates, hexF.name);

  return {
    queryMap,
    coordinatesMap,
  }
};
const assertMapsEqual = (map1, map2) => {
  expect(map1.size).toBe(map2.size);
  let testVal;
  for (const [key, val] of map1) {
    testVal = map2.get(key);
    if (testVal && typeof testVal === 'object') {
      expect(testVal).toEqual(val);
    } else {
      expect(testVal).toBe(val);
      expect(testVal === undefined && !map2.has(key)).not.toBeTruthy();
    }
  }
};
const assertRemoveSuccess = (hexToRemove, hexNameToRemove, queryMap, coordinatesMap) => {
  const { queryMap: queryMapOriginal, coordinatesMap: coordinatesMapOriginal } = setUpForRemoving(1);
  queryMapOriginal.delete(hexNameToRemove);
  delete queryMapOriginal.get('a')[1];
  delete queryMapOriginal.get('e')[5];
  coordinatesMapOriginal.delete('1,-1');

  assertMapsEqual(queryMap, queryMapOriginal);
  assertMapsEqual(coordinatesMap, coordinatesMapOriginal);
};
// See the grid illustration of setUpForRemoving() function to know what hexPosition is
const assertAddHexSuccessToPosition = (hexPosition = 1, hexNameToAdd, queryMap, coordinatesMap) => {
  const { queryMap: queryMapOriginal, coordinatesMap: coordinatesMapOriginal } = setUpForAdding();
  if (hexPosition === 1) {
    queryMapOriginal.set(hexNameToAdd, { 2: 'e', 4: 'a', coordinates: '1,-1' });
    queryMapOriginal.get('a')[1] = hexNameToAdd;
    queryMapOriginal.get('e')[5] = hexNameToAdd;
    coordinatesMapOriginal.set('1,-1', hexNameToAdd);
  } else if (hexPosition === 2) {
    queryMapOriginal.set(hexNameToAdd, { 1: 'e', 2: 'd', 3: 'c', 4: 'b', 5: 'a', coordinates: '1,0' });
    queryMapOriginal.get('a')[2] = hexNameToAdd;
    queryMapOriginal.get('b')[1] = hexNameToAdd;
    queryMapOriginal.get('c')[0] = hexNameToAdd;
    queryMapOriginal.get('d')[5] = hexNameToAdd;
    queryMapOriginal.get('e')[4] = hexNameToAdd;
    coordinatesMapOriginal.set('1,0', hexNameToAdd);
  }
  assertMapsEqual(queryMap, queryMapOriginal);
  assertMapsEqual(coordinatesMap, coordinatesMapOriginal);
};
const assertNoHexFConnectToBCD = (queryMap, coordinatesMap) => {
  const hexB = queryMap.get('b');
  const hexC = queryMap.get('c');
  const hexD = queryMap.get('d');

  expect(hexB).toEqual({ 0: 'a', 2: 'c', coordinates: '0,1' });
  expect(coordinatesMap.get(hexB.coordinates)).toBe('b');

  expect(hexC).toEqual({ 1: 'd', 5: 'b', coordinates: '1,1' });
  expect(coordinatesMap.get(hexC.coordinates)).toBe('c');

  expect(hexD).toEqual({ 0: 'e', 4: 'c', coordinates: '2,0' });
  expect(coordinatesMap.get(hexD.coordinates)).toBe('d');
};

describe('Test hex util function: updateAllHexesBordersAround()', () => {
  test('add new hex f to border 1 of hex a => update hex a and e', () => {
    const { queryMap, coordinatesMap } = setUpForAdding();    // Look at setup function for grid illustration
    const hexToAdd = {
      name: 'f',
      props: { coordinates: '1,-1' },
    };
    updateAllHexesBordersAround(hexToAdd.props, hexToAdd.name, true, queryMap, coordinatesMap);

    assertAddHexSuccessToPosition(1, hexToAdd.name, queryMap, coordinatesMap);
  });
  test('add new hex f to border 5 of hex d => update hex a, b, c, d and e', () => {
    const { queryMap, coordinatesMap } = setUpForAdding();    // Look at setup function for grid illustration
    const hexToAdd = {
      name: 'f',
      props: { coordinates: '1,0' },
    };
    updateAllHexesBordersAround(hexToAdd.props, hexToAdd.name, true, queryMap, coordinatesMap);

    assertAddHexSuccessToPosition(2, hexToAdd.name, queryMap, coordinatesMap);
  });
  test('remove hex f connected to border 5 of hex e => update hex a and e', () => {
    const { queryMap, coordinatesMap } = setUpForRemoving(1);  // Look at setup function for grid illustration
    const hexToRemove = {
      name: 'f',
      props: { 2: 'e', 4: 'a', coordinates: '1,-1' },
    };
    updateAllHexesBordersAround(hexToRemove.props, hexToRemove.name, false, queryMap, coordinatesMap);
    assertRemoveSuccess(hexToRemove.props, hexToRemove.name, queryMap, coordinatesMap);
  });
  test('remove hex f connected to border 2 of hex a => update hex a, b, c, d and e', () => {
    const { queryMap, coordinatesMap } = setUpForRemoving(2);  // Look at setup function for grid illustration
    const hexToRemove = {
      name: 'f',
      props: { 1: 'e', 2: 'd', 3: 'c', 4: 'b', 5: 'a', coordinates: '1,0' },
    };
    updateAllHexesBordersAround(hexToRemove.props, hexToRemove.name, false, queryMap, coordinatesMap);
    assertRemoveSuccess(hexToRemove.props, hexToRemove.name, queryMap, coordinatesMap);
  });
});

describe('Test hex util function: addHex()', () => {
  test('add new hex a initially', () => {
    const newHexName = 'a';

    const { queryMap, coordinatesMap } = addHex({ name: newHexName });

    const hexA = queryMap.get(newHexName);

    expect(hexA).toEqual({ coordinates: '0,0' });
    expect(coordinatesMap.get(hexA.coordinates)).toBe(newHexName);
  });
  test('add new hex f to border 1 of hex a => update hex a and e', () => {
    const { queryMap, coordinatesMap } = setUpForAdding();    // Look at setup function for grid illustration
    const name = 'f';
    const toHexName = 'a';
    const atBorderNo = 1;

    addHex({ name, toHexName, atBorderNo, queryMap, coordinatesMap });

    assertAddHexSuccessToPosition(1, name, queryMap, coordinatesMap);
  });
  test('add new hex f to border 5 of hex d => update hex a, b, c, d and e', () => {
    const { queryMap, coordinatesMap } = setUpForAdding();    // Look at setup function for grid illustration
    const name = 'f';
    const toHexName = 'd';
    const atBorderNo = 5;

    addHex({ name, toHexName, atBorderNo, queryMap, coordinatesMap });

    assertAddHexSuccessToPosition(2, name, queryMap, coordinatesMap);
  });
});

describe('Test hex util function: breadthFirstSearch()', () => {
  test('found a path from hex a to e without touching hex f (connected to a at border 1 of a)', () => {
    const { queryMap } = setUpForRemoving(1);  // Look at setup function for grid illustration
    const found = breadthFirstSearch('a', 'e', queryMap, 'f');
    expect(found).toBe(true);
  });
  test('found a path from hex a to e without touching hex f (connected to a at border 2 of a)', () => {
    const { queryMap } = setUpForRemoving(2);  // Look at setup function for grid illustration
    const found = breadthFirstSearch('a', 'e', queryMap, 'f');
    expect(found).toBe(true);
  });
  test('NOT found any path from hex a to e without touching hex b', () => {
    const { queryMap } = setUpForAdding();  // Look at setup function for grid illustration
    const found = breadthFirstSearch('a', 'e', queryMap, 'c');
    expect(found).toBe(false);
  });
  test('NOT found any path from hex a to e without touching hex c', () => {
    const { queryMap } = setUpForAdding();  // Look at setup function for grid illustration
    const found = breadthFirstSearch('a', 'e', queryMap, 'c');
    expect(found).toBe(false);
  });
  test('NOT found any path from hex a to e without touching hex d', () => {
    const { queryMap } = setUpForAdding();  // Look at setup function for grid illustration
    const found = breadthFirstSearch('a', 'e', queryMap, 'd');
    expect(found).toBe(false);
  });
  test(`NOT found any path from hex a to e (added f connected to b at border 5 of b) without touching hex b`, () => {
    const { queryMap } = setUpForAdding();  // Look at setup function for grid illustration
    /*
                        ___       ___
                   ___ / a \     / e \
                  / f \\___/     \___/
                  \___// b \ ___ / d \
                       \___// c \\___/
                            \___/
      a (0,0); b(0,1); c(1,1); d(2,0); e(2,-1); f(-1,1)
     */
    const hexF = {
      name: 'f',
      props: { 1: 'a', 2: 'b', coordinates: '-1,1' },
    };
    queryMap.get('a')[4] = hexF.name;
    queryMap.get('b')[5] = hexF.name;
    queryMap.set(hexF.name, hexF.props);

    const found = breadthFirstSearch('a', 'e', queryMap, 'b');
    expect(found).toBe(false);
  });
  test(`NOT found any path from hex a to e (added f connected to b at border 3 of b) without touching hex c
        (connected to a at border 3 of a)`, () => {
    const { queryMap } = setUpForAdding();  // Look at setup function for grid illustration
    /*
                       ___       ___
                      / a \     / e \
                      \___/     \___/
                      / b \ ___ / d \
                      \___// c \\___/
                      / f \\___/
                      \___/
      a (0,0); b(0,1); c(1,1); d(2,0); e(2,-1); f(0,2)
     */
    const hexF = {
      name: 'f',
      props: { 0: 'b', 1: 'c', coordinates: '0,2' },
    };
    queryMap.get('b')[3] = hexF.name;
    queryMap.get('c')[4] = hexF.name;
    queryMap.set(hexF.name, hexF.props);

    const found = breadthFirstSearch('a', 'e', queryMap, 'c');
    expect(found).toBe(false);
  });
});

describe('Test hex util function: removeHex()', () => {
  test('remove hex f connected to border 5 of hex e => update hex a and e', () => {
    const { queryMap, coordinatesMap } = setUpForRemoving(1);  // Look at setup function for grid illustration
    const hexToRemove = {
      name: 'f',
      props: { 2: 'e', 4: 'a', coordinates: '1,-1' },
    };
    const success = removeHex(hexToRemove.name, queryMap, coordinatesMap);
    expect(success).toBe(true);
    assertRemoveSuccess(hexToRemove.props, hexToRemove.name, queryMap, coordinatesMap);
  });
  test('remove hex f connected to border 2 of hex a => update hex a, b, c, d and e', () => {
    const { queryMap, coordinatesMap } = setUpForRemoving(2);  // Look at setup function for grid illustration
    const hexToRemove = {
      name: 'f',
      props: { 1: 'e', 2: 'd', 3: 'c', 4: 'b', 5: 'a', coordinates: '1,0' },
    };
    const success = removeHex(hexToRemove.name, queryMap, coordinatesMap);
    expect(success).toBe(true);
    assertRemoveSuccess(hexToRemove.props, hexToRemove.name, queryMap, coordinatesMap);
  });
  test(`remove hex e (with new hex g and h connected to border 0 and 1 of e respectively) => update hex f, g, h and d`, () => {
    const { queryMap, coordinatesMap } = setUpForRemoving(1);  // Look at setup function for grid illustration
    /*
                                         ___
                                    ___ / g \ ___
                               ___ / f \\___// h \
                              / a \\___// e \\___/
                              \___/     \___/
                              / b \ ___ / d \
                              \___// c \\___/
                                   \___/
      a (0,0); b(0,1); c(1,1); d(2,0); e(2,-1); f(1,-1); g(2,-2); h(3,-2)
     */
    const hexToRemove = {
      name: 'e',
      props: { 0: 'g', 1: 'h', 3: 'd', 5: 'f', coordinates: '2,-1' },
    };
    const hexG = {
      name: 'g',
      props: { 2: 'h', 3: 'e', 4: 'f', coordinates: '2,-2' },
    };
    const hexH = {
      name: 'h',
      props: { 4: 'e', 5: 'g', coordinates: '3,-2' },
    };
    queryMap.set(hexG.name, hexG.props);
    queryMap.set(hexH.name, hexH.props);
    queryMap.set(hexToRemove.name, hexToRemove.props);  // Update hex e
    queryMap.get('f')[1] = hexG.name;

    coordinatesMap.set(hexG.props.coordinates, hexG.name);
    coordinatesMap.set(hexH.props.coordinates, hexH.name);

    const success = removeHex(hexToRemove.name, queryMap, coordinatesMap);
    expect(success).toBe(true);

    const { queryMap: queryMapOriginal, coordinatesMap: coordinatesMapOriginal } = setUpForRemoving(1);
    queryMapOriginal.set(hexG.name, { 2: 'h', 4: 'f', coordinates: '2,-2' });
    queryMapOriginal.set(hexH.name, { 5: 'g', coordinates: '3,-2' });
    queryMapOriginal.delete(hexToRemove.name);  // Delete hex e
    queryMapOriginal.get('f')[1] = hexG.name;
    delete queryMapOriginal.get('f')[2];
    delete queryMapOriginal.get('d')[0];

    coordinatesMapOriginal.set(hexG.props.coordinates, hexG.name);
    coordinatesMapOriginal.set(hexH.props.coordinates, hexH.name);
    coordinatesMapOriginal.delete(hexToRemove.props.coordinates);

    assertMapsEqual(queryMap, queryMapOriginal);
    assertMapsEqual(coordinatesMap, coordinatesMapOriginal);
  });
  test('remove hex a', () => {
    const { queryMap, coordinatesMap } = setUpForAdding();  // Look at setup function for grid illustration
    const hexToRemove = {
      name: 'a',
      props: { 3: 'b', coordinates: '0,0' },
    };
    const success = removeHex(hexToRemove.name, queryMap, coordinatesMap);
    expect(success).toBe(true);

    const { queryMap: queryMapOriginal, coordinatesMap: coordinatesMapOriginal } = setUpForAdding();
    queryMapOriginal.delete(hexToRemove.name);
    delete queryMapOriginal.get('b')[0];

    coordinatesMapOriginal.delete(hexToRemove.props.coordinates);

    assertMapsEqual(queryMap, queryMapOriginal);
    assertMapsEqual(coordinatesMap, coordinatesMapOriginal);
  });
  test('remove hex e', () => {
    const { queryMap, coordinatesMap } = setUpForAdding();  // Look at setup function for grid illustration
    const hexToRemove = {
      name: 'e',
      props: { 3: 'd', coordinates: '2,-1' },
    };
    const success = removeHex(hexToRemove.name, queryMap, coordinatesMap);
    expect(success).toBe(true);

    const { queryMap: queryMapOriginal, coordinatesMap: coordinatesMapOriginal } = setUpForAdding();
    queryMapOriginal.delete(hexToRemove.name);
    delete queryMapOriginal.get('d')[0];

    coordinatesMapOriginal.delete(hexToRemove.props.coordinates);

    assertMapsEqual(queryMap, queryMapOriginal);
    assertMapsEqual(coordinatesMap, coordinatesMapOriginal);
  });
  test('should NOT remove hex b', () => {
    const { queryMap, coordinatesMap } = setUpForAdding();  // Look at setup function for grid illustration
    const hexToRemove = {
      name: 'b',
      props: { 0: 'a', 2: 'c', coordinates: '0,1' },
    };
    const success = removeHex(hexToRemove.name, queryMap, coordinatesMap);
    expect(success).toBe(false);

    const { queryMap: queryMapOriginal, coordinatesMap: coordinatesMapOriginal } = setUpForAdding();

    assertMapsEqual(queryMap, queryMapOriginal);
    assertMapsEqual(coordinatesMap, coordinatesMapOriginal);
  });
  test('should NOT remove hex c', () => {
    const { queryMap, coordinatesMap } = setUpForAdding();  // Look at setup function for grid illustration
    const hexToRemove = {
      name: 'c',
      props: { 1: 'd', 5: 'b', coordinates: '1,1' },
    };
    const success = removeHex(hexToRemove.name, queryMap, coordinatesMap);
    expect(success).toBe(false);

    const { queryMap: queryMapOriginal, coordinatesMap: coordinatesMapOriginal } = setUpForAdding();

    assertMapsEqual(queryMap, queryMapOriginal);
    assertMapsEqual(coordinatesMap, coordinatesMapOriginal);
  });
  test('should NOT remove hex d', () => {
    const { queryMap, coordinatesMap } = setUpForAdding();  // Look at setup function for grid illustration
    const hexToRemove = {
      name: 'd',
      props: { 0: 'e', 4: 'c', coordinates: '2,0' },
    };
    const success = removeHex(hexToRemove.name, queryMap, coordinatesMap);
    expect(success).toBe(false);

    const { queryMap: queryMapOriginal, coordinatesMap: coordinatesMapOriginal } = setUpForAdding();

    assertMapsEqual(queryMap, queryMapOriginal);
    assertMapsEqual(coordinatesMap, coordinatesMapOriginal);
  });
});

describe('Test hex util function: searchHex()', () => {
  test('search hex a', () => {
    const { queryMap } = setUpForAdding();  // Look at setup function for grid illustration
    const hexA = searchHex('a', queryMap);
    expect(hexA).toEqual(queryMap.get('a'));
  });
  test('search hex b', () => {
    const { queryMap } = setUpForAdding();  // Look at setup function for grid illustration
    const hexA = searchHex('b', queryMap);
    expect(hexA).toEqual(queryMap.get('b'));
  });
});

describe('Test hex util: Queue', () => {
  test('enqueue and dequeue until null is returned', () => {
    const queue = new Queue();
    queue.enqueue('a');
    queue.enqueue(1);
    queue.enqueue('b');
    queue.enqueue(2);
    queue.enqueue(3);
    queue.enqueue('c');

    expect(queue.dequeue()).toBe('a');
    expect(queue.dequeue()).toBe(1);
    expect(queue.dequeue()).toBe('b');
    expect(queue.dequeue()).toBe(2);
    expect(queue.dequeue()).toBe(3);
    expect(queue.dequeue()).toBe('c');
    expect(queue.dequeue()).toBe(null);
  });
});
