var app = angular.module('crossStitchApp', []);

app.controller('StitchController', function($scope) {
    var canvas = document.getElementById('stitchCanvas');
    paper.setup(canvas);

    // Initialize variables
    $scope.gridSize = 20;
    $scope.currentTool = 'cross';
    $scope.currentColor = '#000000';
    $scope.threadColors = [
        '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
        '#FF00FF', '#00FFFF', '#000000', '#FFFFFF',
        '#8B4513', '#FFA500', '#800080', '#008000'
    ];

    // Grid creation
    var grid = new paper.Group();
    
    function createGrid() {
        grid.removeChildren();
        
        var width = paper.view.size.width;
        var height = paper.view.size.height;
        
        for (var x = 0; x < width; x += $scope.gridSize) {
            var path = new paper.Path.Line(
                new paper.Point(x, 0),
                new paper.Point(x, height)
            );
            path.strokeColor = '#ddd';
            path.strokeWidth = 0.5;
            grid.addChild(path);
        }
        
        for (var y = 0; y < height; y += $scope.gridSize) {
            var path = new paper.Path.Line(
                new paper.Point(0, y),
                new paper.Point(width, y)
            );
            path.strokeColor = '#ddd';
            path.strokeWidth = 0.5;
            grid.addChild(path);
        }
    }

    // Create initial grid
    createGrid();

    // Handle window resize
    paper.view.onResize = function() {
        createGrid();
    };

    // Create cross stitch
    function createCrossStitch(point) {
        var gridPoint = new paper.Point(
            Math.floor(point.x / $scope.gridSize) * $scope.gridSize,
            Math.floor(point.y / $scope.gridSize) * $scope.gridSize
        );

        var cross = new paper.Group();

        // First line of the cross
        var line1 = new paper.Path.Line({
            from: [gridPoint.x, gridPoint.y],
            to: [gridPoint.x + $scope.gridSize, gridPoint.y + $scope.gridSize],
            strokeColor: $scope.currentColor,
            strokeWidth: 2
        });

        // Second line of the cross
        var line2 = new paper.Path.Line({
            from: [gridPoint.x + $scope.gridSize, gridPoint.y],
            to: [gridPoint.x, gridPoint.y + $scope.gridSize],
            strokeColor: $scope.currentColor,
            strokeWidth: 2
        });

        cross.addChild(line1);
        cross.addChild(line2);
    }

    // Fill cell with color
    function fillCell(point) {
        var gridPoint = new paper.Point(
            Math.floor(point.x / $scope.gridSize) * $scope.gridSize,
            Math.floor(point.y / $scope.gridSize) * $scope.gridSize
        );

        var rect = new paper.Path.Rectangle({
            point: gridPoint,
            size: [$scope.gridSize, $scope.gridSize],
            fillColor: $scope.currentColor
        });
    }

    // Handle mouse events
    var tool = new paper.Tool();
    
    tool.onMouseDown = function(event) {
        if ($scope.currentTool === 'cross') {
            createCrossStitch(event.point);
        } else if ($scope.currentTool === 'fill') {
            fillCell(event.point);
        }
    }

    tool.onMouseDrag = function(event) {
        if ($scope.currentTool === 'cross') {
            createCrossStitch(event.point);
        } else if ($scope.currentTool === 'fill') {
            fillCell(event.point);
        }
    }

    // Scope methods
    $scope.setTool = function(tool) {
        $scope.currentTool = tool;
    };

    $scope.selectColor = function(color) {
        $scope.currentColor = color;
    };

    $scope.adjustGrid = function() {
        var size = prompt('Enter new grid size (px):', $scope.gridSize);
        if (size && !isNaN(size)) {
            $scope.gridSize = parseInt(size);
            createGrid();
        }
    };

    $scope.uploadImage = function(event) {
        var reader = new FileReader();
        reader.onload = function(e) {
            var img = new Image();
            img.onload = function() {
                var raster = new paper.Raster({
                    source: img,
                    position: paper.view.center
                });
                
                // Scale image to fit canvas while maintaining aspect ratio
                var scale = Math.min(
                    (paper.view.size.width * 0.8) / img.width,
                    (paper.view.size.height * 0.8) / img.height
                );
                raster.scale(scale);
                
                // Pixelate effect
                raster.pixelate($scope.gridSize);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(event.target.files[0]);
    };

    // View update
    paper.view.draw();
});
