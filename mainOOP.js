(function Tetris(){

    this.Arena = {
        init: function() {
            this.mainCanvas = $('#arena')[0];
            this.MCContext = this.mainCanvas.getContext('2d');
    
            this.MCContext.scale(20, 20);
    
            this.dropCounter = 0;
            this.dropInterval = 1000;
            this.lastTime = 0;
    
    
            this.arena = this.createMatrix(12, 20);
    
            this.colors = [
                null,
                '#B22222',
                '#0269A4',
                '#CCCC00',
                '#4B0082',
                '#228B22',
                '#B2497D',
                '#FF8C00'
            ];
        },
    
        createPiece: function(type) {
            switch (type) {
                case 'T':
                    return [
                        [0, 0, 0],
                        [1, 1, 1],
                        [0, 1, 0]
                    ];
                    break;
                case 'O':
                    return [
                        [2, 2, 0],
                        [2, 2, 0],
                        [0, 0, 0]
                    ];
                    break;
                case 'L':
                    return [
                        [3, 0, 0],
                        [3, 0, 0],
                        [3, 3, 0]
                    ];
                    break;
                case 'J':
                    return [
                        [0, 4, 0],
                        [0, 4, 0],
                        [4, 4, 0]
                    ];
                    break;
                case 'S':
                    return [
                        [0, 5, 5],
                        [5, 5, 0],
                        [0, 0, 0]
                    ];
                    break;
                case 'Z':
                    return [
                        [6, 6, 0],
                        [0, 6, 6],
                        [0, 0, 0]
                    ];
                    break;
                case 'I':
                    return [
                        [0, 0, 7, 0],
                        [0, 0, 7, 0],
                        [0, 0, 7, 0],
                        [0, 0, 7, 0]
                    ];
                    break;
        
            }
        },
    
        updateScore: function () {
            $('#score_count').text(Player.score);
        },
    
        rotate: function (matrix, dir) {
            for (var y = 0; y < matrix.length; ++y) {
                for (var x = 0; x < y; ++x) {
                    [ matrix[x][y], matrix[y][x] ] = [ matrix[y][x], matrix[x][y] ]
                }
            }
        
            if (dir > 0) {
                matrix.forEach(function(row){
                    row.reverse();
                });
            } else {
                matrix.reverse();
            }
        },
    
        collide: function (arena, player) {
            var [m, o] = [player.matrix, player.position];
            for (var y = 0; y < m.length; ++y) {
                for (var x = 0; x < m[y].length; ++x) {
                    if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                        return true;
                    }
                }
            }
            return false;
        },
    
        merge: function (arena, player) {
            player.matrix.forEach(function(row, y){
                row.forEach(function(value, x){
                    if (value !== 0) {
                        arena[y + player.position.y][x + player.position.x] = value;
                    }
                });
            });
        },
        
        update: function (time = 0) {
            var currentTime = time - Arena.lastTime;
            Arena.lastTime = time;
        
            Arena.dropCounter += currentTime;
        
            if (Arena.dropCounter > Arena.dropInterval) {
                Player.playerDrop();
            }
        
            Arena.draw();
            requestAnimationFrame(Arena.update);
        },
    
        arenaSweep: function () {
            var rowCounter = 1;
            outer : for (var y = Arena.arena.length - 1; y > 0; --y) {
                for (var x = 0; x < Arena.arena[y].length; ++x) {
                    if (Arena.arena[y][x] === 0) {
                        continue outer;
                    }
                }
        
                var row = Arena.arena.splice(y, 1)[0].fill(0);
                Arena.arena.unshift(row);
                ++y;
        
                Player.score += rowCounter * 10;
                rowCounter *= 2;
            }
        },
    
        createMatrix: function (width, height) {
            var matrix = [];
    
            while (height--){
                matrix.push(new Array(width).fill(0));
            }
            return matrix;
        },
    
        drawMatrix: function (matrix, offset){
            matrix.forEach(function(row, y){
                row.forEach(function(value, x){
                    if (value !== 0) {
                        Arena.MCContext.fillStyle = Arena.colors[value];
                        Arena.MCContext.fillRect(x + offset.x, y + offset.y, 1, 1)
                    }
                });
            });
        },
    
        draw: function () {
        
            this.MCContext.fillStyle = '#000';
            this.MCContext.fillRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
        
            FigureBoard.NFCContext.fillStyle = "#000";
            FigureBoard.NFCContext.fillRect(0, 0, FigureBoard.nextFigureCanvas.width, FigureBoard.nextFigureCanvas.height);
            
        
            this.drawMatrix(Arena.arena, {x:0, y:0});
            this.drawMatrix(Player.matrix, Player.position);
            FigureBoard.drawNextMatrix(FigureBoard.nextFigureMatrix);
        }
    }
    
    this.Player = {
        init: function(){
            this.position = {x: 0, y: 0};
            this.matrix = null;
            this.score = 0;
    
            this.initEvents();
        },
    
        playerRotate: function (dir) {
            var pos = Player.position.x;
            var offset = 1;
            Arena.rotate(Player.matrix, dir);
            while (Arena.collide(Arena.arena, Player)) {
                Player.position.x += offset;
                offset = -(offset + (offset > 0 ? 1 : -1))
                if (offset > Player.matrix[0].length) {
                    Arena.rotate(Player.matrix, -dir);
                    Player.position.x = pos;
                    return;
                }
            }
        },
    
        playerReset: function () {
            var pieces = 'ILJOTSZ';
            Player.matrix = FigureBoard.nextFigureMatrix.length ? FigureBoard.nextFigureMatrix : Arena.createPiece(pieces[pieces.length * Math.random() | 0]);
            FigureBoard.nextFigureMatrix = Arena.createPiece(pieces[pieces.length * Math.random() | 0]);
            Player.position.y = 0;
            Player.position.x = (Arena.arena[0].length / 2 | 0) - (Player.matrix[0].length / 2 | 0);
            if (Arena.collide(Arena.arena, Player)) {
                Arena.arena.forEach(function(row){
                    row.fill(0);
                });
        
                Player.score = 0;
                Arena.updateScore();
            }
        },
    
        playerMove: function (dir) {
            Player.position.x += dir;
            if (Arena.collide(Arena.arena, Player)) {
                Player.position.x -= dir;
            }
        },
    
        playerDrop: function (){
            Player.position.y++;
            if (Arena.collide(Arena.arena, Player)) {
                Player.position.y--;
                Arena.merge(Arena.arena, Player);
                Player.playerReset();
                Arena.arenaSweep();
                Arena.updateScore();
            }
            Arena.dropCounter = 0;
        },
    
        initEvents: function() {
            $(document).on('keydown', function(e) {
                var originalEvent = e.originalEvent;
                var keyCode = originalEvent.keyCode;
            
                switch (keyCode) {
                    case 37:
                        Player.playerMove(-1);
                        break;
                    case 39:
                        Player.playerMove(1);
                        break;
                    case 40:
                        Player.playerDrop();
                        break;
                    case 87:
                        Player.playerRotate(1);
                        break;
                    case 81:
                        Player.playerRotate(-1);
                        break;
                }
            });
        }
    }
    
    this.FigureBoard = {
        init: function() {
            this.nextFigureArena = Arena.createMatrix(4, 4);
            this.nextFigureMatrix = [];
    
            this.nextFigureCanvas = $('#next_figure_field')[0];
            this.NFCContext = this.nextFigureCanvas.getContext('2d');
    
            this.NFCContext.scale(30, 30);
        },
    
        drawNextMatrix: function (matrix) {
            matrix.forEach(function(row, y){
                row.forEach(function(value, x){
                    if (value !== 0) {
                        FigureBoard.NFCContext.fillStyle = Arena.colors[value];
                        FigureBoard.NFCContext.fillRect(x+2, y+2, 1, 1)
                    }
                });
            });
        }
    }


    Arena.init();
    Player.init();
    FigureBoard.init();


    Player.playerReset();
    Arena.updateScore();
    Arena.update();
})();
