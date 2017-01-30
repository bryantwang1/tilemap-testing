var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });
// var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.image('ground_1x1', '../assets/tilemaps/tiles/ground_1x1.png');
    game.load.image('car', '../assets/car90.png');

}

var map;
var layer1;
var layer2;
// var layer3;
var pathfinder;
var sprite;

var marker;
var currentTile = 0;
var currentLayer;

var cursors;
var showLayersKey;
var layer1Key;
var layer2Key;
// var layer3Key;
var blocked = false;

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.stage.backgroundColor = '#2d2d2d';

    //  Creates a blank tilemap
    map = game.add.tilemap();

    //  Add a Tileset image to the map
    map.addTilesetImage('ground_1x1');

    //  Creates a new blank layer and sets the map dimensions.
    //  In this case the map is 40x30 tiles in size and the tiles are 32x32 pixels in size.
    layer1 = map.create('level1', 25, 20, 32, 32);
    for(var i = 0; i < 25;i++) {
      for(var j = 0; j < 20;j++) {
        map.putTile(0, i, j, layer1);
      }
    }


    //  Resize the world
    layer1.resizeWorld();

    layer2 = map.createBlankLayer('level2', 25, 20, 32, 32);

    // layer3 = map.createBlankLayer('level3', 25, 20, 32, 32);

    currentLayer = layer2;

    //  Create our tile selector at the top of the screen
    createTileSelector();

    game.input.addMoveCallback(updateMarker, this);

    cursors = game.input.keyboard.createCursorKeys();

    showLayersKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    layer1Key = game.input.keyboard.addKey(Phaser.Keyboard.ONE);
    layer2Key = game.input.keyboard.addKey(Phaser.Keyboard.TWO);
    // layer3Key = game.input.keyboard.addKey(Phaser.Keyboard.THREE);

    showLayersKey.onDown.add(changeLayer, this);
    layer1Key.onDown.add(changeLayer, this);
    layer2Key.onDown.add(changeLayer, this);
    // layer3Key.onDown.add(changeLayer, this);

    console.log(layer1.index);
    console.log(layer2.index);
    // console.log(map.layers); // map.createLayer automatically adds it to a property layers apparently.
    // console.log(layer3.index);
    var walkables = [-1]; // -1 because we're using a layer with no other tiles, so any tile could be an obstacle

    pathfinder = game.plugins.add(Phaser.Plugin.PathFinderPlugin);
    pathfinder.setGrid(map.layers[1].data, walkables); // pass in layer2's data because it's the grid

    sprite = game.add.sprite(50, 50, 'car');
    sprite.anchor.setTo(0.5, 0.5);
    game.physics.enable(sprite);

    game.camera.follow(sprite);
}

function changeLayer(key) {

    switch (key.keyCode)
    {
        case Phaser.Keyboard.SPACEBAR:
            layer1.alpha = 1;
            layer2.alpha = 1;
            // layer3.alpha = 1;
            break;

        case Phaser.Keyboard.ONE:
            currentLayer = layer1;
            layer1.alpha = 1;
            layer2.alpha = 0.2;
            // layer3.alpha = 0.2;
            break;

        case Phaser.Keyboard.TWO:
            currentLayer = layer2;
            layer1.alpha = 0.2;
            layer2.alpha = 1;
            // layer3.alpha = 0.2;
            break;
        //
        // case Phaser.Keyboard.THREE:
        //     currentLayer = layer3;
        //     layer1.alpha = 0.2;
        //     layer2.alpha = 0.2;
        //     layer3.alpha = 1;
        //     break;
    }

}

function pickTile(sprite, pointer) {

    currentTile = game.math.snapToFloor(pointer.x, 32) / 32;
    console.log(currentTile);
}

function updateMarker() {

    marker.x = currentLayer.getTileX(game.input.activePointer.worldX) * 32;
    marker.y = currentLayer.getTileY(game.input.activePointer.worldY) * 32;

    // if (game.input.mousePointer.isDown)
    // {
    //     map.putTile(currentTile, currentLayer.getTileX(marker.x), currentLayer.getTileY(marker.y), currentLayer);
    //     // map.fill(currentTile, currentLayer.getTileX(marker.x), currentLayer.getTileY(marker.y), 4, 4, currentLayer);
    // }

}

function findPathTo(tilex, tiley) {

    pathfinder.setCallbackFunction(function(path) {
        path = path || [];
        for(var i = 0, ilen = path.length; i < ilen; i++) {
            map.putTile(4, path[i].x, path[i].y);
        }
        blocked = false;
    });

    pathfinder.preparePathCalculation([0,0], [tilex,tiley]);
    pathfinder.calculatePath();
}

function update() {

  // game.physics.arcade.collide(sprite, layer);

  sprite.body.velocity.x = 0;
  sprite.body.velocity.y = 0;
  sprite.body.angularVelocity = 0;

  if (cursors.left.isDown)
  {
      sprite.body.angularVelocity = -200;
  }
  else if (cursors.right.isDown)
  {
      sprite.body.angularVelocity = 200;
  }

  if (cursors.up.isDown)
  {
      sprite.body.velocity.copyFrom(game.physics.arcade.velocityFromAngle(sprite.angle, 300));
  }

  marker.x = layer2.getTileX(game.input.activePointer.worldX) * 32;
  marker.y = layer2.getTileY(game.input.activePointer.worldY) * 32;

  if (game.input.mousePointer.isDown)
    {
        blocked = true;
        findPathTo(layer2.getTileX(marker.x), layer2.getTileY(marker.y));
    }

}

function render() {

    game.debug.text('Current Layer: ' + currentLayer.name, 16, 550);
    game.debug.text('1-2 Switch Layers. SPACE = Show All. Cursors = Move Camera', 16, 570);

}

function createTileSelector() {

    //  Our tile selection window
    var tileSelector = game.add.group();

    var tileSelectorBackground = game.make.graphics();
    tileSelectorBackground.beginFill(0x000000, 0.5);
    tileSelectorBackground.drawRect(0, 0, 800, 34);
    tileSelectorBackground.endFill();

    tileSelector.add(tileSelectorBackground);

    var tileStrip = tileSelector.create(1, 1, 'ground_1x1');
    tileStrip.inputEnabled = true;
    // tileStrip.events.onInputDown.add(pickTile, this);

    tileSelector.fixedToCamera = true;

    //  Our painting marker
    marker = game.add.graphics();
    marker.lineStyle(2, 0x000000, 1);
    marker.drawRect(0, 0, 32, 32);

}
