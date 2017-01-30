(function (window, document, $, undefined) {
    var gameBoard;

    /* Objects */

    function GameBoard() {
        this.mode = null;
        this.selectedPiece = null;
        this.newSquare = null;
        this.whiteTeam = [];
        this.blackTeam = [];
        this.moves = [];
        this.captured = [];
        this.turn = -1;

        this.displayCaptured = function () {
            var i, display;
            display = [];
            for (i = 0; i < this.captured.length; i++) {
                display.push('<span class="' + this.captured[i].piece + ' displayOnly"></span>');
            }
            return display;
        }

        this.displayMoves = function () {
            var i, display;
            display = [];
            for (i = this.moves.length; i > 0; i--) {
                display.push('<div>' + (i) + this.moves[i - 1].display() + '</div>');
            }
            return display;
        }
        
        this.updateMessage = function () {
            $('.moves-list').html(gameBoard.displayMoves());
            $('.captured-list').html(gameBoard.displayCaptured());
            $('.nextTurn').text(gameBoard.turn > 0 ? "White" : "Black");
        };

        this.renderPieces = function () {
            $('.square').removeClass('highlighted selectable killable selected white-man white-king black-man black-king')
            .addClass('empty');

            for (var i = 0; i < this.whiteTeam.length; i++) {
                $('#' + this.whiteTeam[i].square).toggleClass(this.whiteTeam[i].piece + ' empty');
            }
            for (var i = 0; i < this.blackTeam.length; i++) {
                $('#' + this.blackTeam[i].square).toggleClass(this.blackTeam[i].piece + ' empty');
            }
        }

        this.findPiece = function (id) {
            var pieces, i;
            pieces = this.whiteTeam.concat(this.blackTeam);
            for (i = 0; i < pieces.length; i++) {
                if (pieces[i].square == id) {
                    return pieces[i];
                }
            }
            return null;
        }

        this.removePiece = function (piece) {
            var team;
            team = piece.friendly() == "white" ? this.whiteTeam : this.blackTeam;

            for (var i = 0; i < team.length; i++) {
                if (team[i].square == piece.square) {
                    team.splice(i, 1);
                    break;
                }
            }
        }

        this.calculateMoves = function () {
            var i;
            for (i = 0; i < this.whiteTeam.length; i++) {
                this.whiteTeam[i].checkMoves();
            } for (i = 0; i < this.blackTeam.length; i++) {
                this.blackTeam[i].checkMoves();
            }
        }

        this.highlightPieces = function () {
            var team;
            team = this.turn > 0 ? this.whiteTeam : this.blackTeam;

            $('.square').removeClass('selectable highlighted killable');

            for (i = 0; i < team.length; i++) {
                if (team[i].validMoves.length > 0 || team[i].killMoves.length > 0) {
                    $('#' + team[i].square).addClass('selectable');
                }
            }
            if (this.selectedPiece) {
                $('#' + this.selectedPiece.square).addClass('selected');
            }
        }

        this.rankCount = function (rank) {
            var pieces, i, count;
            count = 0;
            pieces = this.whiteTeam.concat(this.blackTeam);
            for (i = 0; i < pieces.length; i++) {
                if (pieces[i].rank() == rank) {
                    count++;
                }
            }
            return count;

        }


        this.checkForWinner = function () {
            if (this.mode == 'standard') {
                if (this.whiteTeam.length == 0 || this.blackTeam.length == 0) {
                    $('.winnerInfo').removeClass('hidden');
                    $('.winner').text(this.turn > 0 ? 'White' : 'Black');
                } else {
                    $('.winnerInfo').addClass('hidden');
                    $('.winner').text('');
                }
            }
        }

        this.changeTurns = function () {
            
            this.checkForWinner();

            this.turn *= -1;
            this.renderPieces();
            this.calculateMoves();
            this.highlightPieces();
            this.updateMessage();
        };

        this.getLastMove = function () {
            return this.moves[this.moves.length - 1];
        };

        this.jumpPiece = function (jumpSquare) {
            var capturePiece, newCol, newRow, newId;
            newId = getId(this.newSquare);
            newCol = translate(newId.split('')[0]);
            newRow = parseInt(newId.split('')[1]);

            if (this.findPiece(newId) && (this.findPiece(newId).friendly() == this.selectedPiece.enemy())) {
                capturePiece = this.findPiece(newId);
                capturePiece.square = null;
                this.removePiece(jumpSquare);
                this.captured.push(capturePiece);
            }
        };

        this.movePiece = function () {
            var capturePiece, newCol, newRow, newId, canContinue;
            newId = getId(this.newSquare);

            newCol = translate(newId.split('')[0]);
            newRow = parseInt(newId.split('')[1]);
            canContinue = true;

            if ((Math.abs(this.selectedPiece.col() - newCol) == 2) && (Math.abs(this.selectedPiece.row() - newRow) == 2)) {

                for (var i = 0; i < this.selectedPiece.killMoves.length; i++) {
                    var test = this.selectedPiece.killMoves[i].split(' ')[0];
                    var test2 = this.selectedPiece.killMoves[i].split(' ')[1];
                    if (test == newId) {
                        capturePiece = this.findPiece(test2);
                        capturePiece.square = null;
                        this.removePiece(capturePiece);
                        this.captured.push(capturePiece);
                    }
                }

                this.moves.push(new Move(this.selectedPiece.piece, this.selectedPiece.square, newId));

                this.selectedPiece.square = newId;

                if (this.selectedPiece.rank() == 'man' && ((this.selectedPiece.friendly() == 'white' && newRow == 8) || (this.selectedPiece.friendly() == 'black' && newRow == 1))) {
                    var newPiece = this.selectedPiece.friendly() + '-' + 'king';
                    this.selectedPiece.piece = newPiece;
                }

                this.calculateMoves();
                this.renderPieces();
                this.highlightPieces();

                if (this.selectedPiece.killMoves.length == 0) {
                    this.changeTurns();
                } else {
                    this.selectedPiece.validMoves = [];
                    this.selectedPiece.highlightMoves();
                }
            } else {
                this.moves.push(new Move(this.selectedPiece.piece, this.selectedPiece.square, newId));

                this.selectedPiece.square = newId;

                if (this.selectedPiece.rank() == 'man' && ((this.selectedPiece.friendly() == 'white' && newRow == 8) || (this.selectedPiece.friendly() == 'black' && newRow == 1))) {
                    var newPiece = this.selectedPiece.friendly() + '-' + 'king';
                    this.selectedPiece.piece = newPiece;
                }

                this.changeTurns();
            }
        };

        this.reset = function (newMode) {
            $('.mode').removeClass("active");
            $('#' + newMode).parent('.mode').addClass("active");
            $('.winnerInfo').addClass("hidden");
            $('.pawnPromotion').addClass('hidden');

            this.mode = newMode;
            this.turn = -1;
            this.moves = [];
            this.captured = [];
            this.selectedPiece = null;
            this.newSquare = null;

            this.buildBoard();
            setClickHandlers();
            this.updateMessage();
        };

        this.buildBoard = function () {
            $('.board').html('');
            for (c = 8; c > 0; c--) {
                for (r = 1; r <= 8; r++) {
                    var $div = $("<div>", { id: '' + translate(r) + c, "class": "empty square" });
                    $('.board').append($div);
                }
            }
        };
    }

    function Piece(piece, square) {
        this.piece = piece;
        this.square = square;

        this.validMoves = [];
        this.killMoves = [];

        this.friendly = function () {
            return this.piece.split('-')[0];
        }
        this.enemy = function () {
            return this.piece.split('-')[0] == 'white' ? 'black' : 'white';
        }
        this.rank = function () {
            return this.piece.split('-')[1];
        }
        this.col = function () {
            return translate(this.square.split('')[0]);
        }
        this.row = function () {
            return parseInt(this.square.split('')[1]);
        }

        this.checkMoves = function () {
            var multiplier, tC, tR, jC, jR, upDn, i;
            
            this.killMoves = [];
            this.validMoves = [];
            multiplier = this.friendly() == 'white' ? 1 : -1;
            upDn = [-1, 1];

            if (this.rank() == 'man') {
                tR = this.row() + multiplier;
                jR = this.row() + (multiplier * 2);
                for (i = 0; i < upDn.length; i++) {
                    tC = this.col() + upDn[i];
                    jC = this.col() + (upDn[i] * 2);
                    checkMove(tC, tR, jC, jR, this);
                }
            }
            else {
                for (i = 0; i < upDn.length; i++) {
                    tR = this.row() + upDn[i];
                    jR = this.row() + (upDn[i] * 2);
                    for (j = 0; j < upDn.length; j++) {
                        tC = this.col() + upDn[j];
                        jC = this.col() + (upDn[j] * 2);
                        checkMove(tC, tR, jC, jR, this);
                    }
                }
                
            }
    
        };

        this.highlightMoves = function () {
            var i;
            for (i = 0; i < this.validMoves.length; i++) {
                $('#' + this.validMoves[i]).addClass('highlighted');
            }
            for (i = 0; i < this.killMoves.length; i++) {
                $('#' + this.killMoves[i].split(' ')[0]).addClass('killable');
            }
        };

        this.copy = function () {
            var newPiece;
            newPiece = new Piece(this.piece, this.square);
            newPiece.validMoves = this.validMoves;
            newPiece.killMoves = this.killMoves;
            return newPiece;
        };
    }
    
    function Move(piece, from, to) {
        this.piece = piece;
        this.from = from;
        this.to = to;

        this.display = function () {
            return ('<span class="' + this.piece + ' displayOnly"></span> ' + this.from + ' ' + this.to);
        };
    }

    function initBoard() {
        gameBoard = new GameBoard();

        gameBoard.reset('standard');

        gameBoard.whiteTeam.push(new Piece('white-man', 'a1'));
        gameBoard.whiteTeam.push(new Piece('white-man', 'c1'));
        gameBoard.whiteTeam.push(new Piece('white-man', 'e1'));
        gameBoard.whiteTeam.push(new Piece('white-man', 'g1'));

        gameBoard.whiteTeam.push(new Piece('white-man', 'b2'));
        gameBoard.whiteTeam.push(new Piece('white-man', 'd2'));
        gameBoard.whiteTeam.push(new Piece('white-man', 'f2'));
        gameBoard.whiteTeam.push(new Piece('white-man', 'h2'));

        gameBoard.whiteTeam.push(new Piece('white-man', 'a3'));
        gameBoard.whiteTeam.push(new Piece('white-man', 'c3'));
        gameBoard.whiteTeam.push(new Piece('white-man', 'e3'));
        gameBoard.whiteTeam.push(new Piece('white-man', 'g3'));

        gameBoard.blackTeam.push(new Piece('black-man', 'b8'));
        gameBoard.blackTeam.push(new Piece('black-man', 'd8'));
        gameBoard.blackTeam.push(new Piece('black-man', 'f8'));
        gameBoard.blackTeam.push(new Piece('black-man', 'h8'));

        gameBoard.blackTeam.push(new Piece('black-man', 'a7'));
        gameBoard.blackTeam.push(new Piece('black-man', 'c7'));
        gameBoard.blackTeam.push(new Piece('black-man', 'e7'));
        gameBoard.blackTeam.push(new Piece('black-man', 'g7'));

        gameBoard.blackTeam.push(new Piece('black-man', 'b6'));
        gameBoard.blackTeam.push(new Piece('black-man', 'd6'));
        gameBoard.blackTeam.push(new Piece('black-man', 'f6'));
        gameBoard.blackTeam.push(new Piece('black-man', 'h6'));
        gameBoard.changeTurns();
	}

    function testKing() {
        gameBoard = new GameBoard();

        gameBoard.reset('standard');

        gameBoard.whiteTeam.push(new Piece('white-man', 'a7'));

        gameBoard.blackTeam.push(new Piece('black-man', 'b2'));

        gameBoard.changeTurns();
    }

    function testMultiJump() {
        gameBoard = new GameBoard();

        gameBoard.reset('standard');

        gameBoard.whiteTeam.push(new Piece('white-man', 'c3'));

        gameBoard.blackTeam.push(new Piece('black-man', 'd4'));

        gameBoard.blackTeam.push(new Piece('black-man', 'f6'));

        gameBoard.changeTurns();
    }

	function translate(rowchar) {
	    switch(rowchar){
	        case 'a':
	            return 1;
	        case 'b':
	            return 2;
	        case 'c':
	            return 3;
	        case 'd':
	            return 4;
	        case 'e':
	            return 5;
	        case 'f':
	            return 6;
	        case 'g':
	            return 7;
	        case 'h':
	            return 8;
	        case 1:
	            return 'a';
	        case 2:
	            return 'b';
	        case 3:
	            return 'c';
	        case 4:
	            return 'd';
	        case 5:
	            return 'e';
	        case 6:
	            return 'f';
	        case 7:
	            return 'g';
	        case 8:
	            return 'h';
	    }
	}

	function inBounds(value) {
	    return (value > 0 && value < 9);
	}

	function checkMove(tC, tR, jC, jR, thisPiece) {
	    var hasFriendly, hasEnemy, jumpFriendly, jumpEnemy, sq, jsq;

	    if (inBounds(tC) && inBounds(tR)) {
	        sq = translate(tC) + tR;

	        hasFriendly = gameBoard.findPiece(sq) && gameBoard.findPiece(sq).friendly() == thisPiece.friendly();
	        hasEnemy = gameBoard.findPiece(sq) && gameBoard.findPiece(sq).friendly() == thisPiece.enemy();

	        if (!hasFriendly && !hasEnemy) {
	            thisPiece.validMoves.push('' + translate(tC) + tR);
	        }
	        if (hasEnemy) {
	            if (inBounds(jC) && inBounds(jR)) {
	                jsq = translate(jC) + jR;
	                jumpFriendly = gameBoard.findPiece(jsq) && gameBoard.findPiece(jsq).friendly() == thisPiece.friendly();
	                jumpEnemy = gameBoard.findPiece(jsq) && gameBoard.findPiece(jsq).friendly() == thisPiece.enemy();
	                if (!jumpFriendly && !jumpEnemy) {
	                    thisPiece.killMoves.push('' + translate(jC) + jR + ' ' + translate(tC) + tR);
	                }
	            } else {
	                return false;
	            }
	        }
	        return hasFriendly;
	    } else {
	        return false;
	    }
	}

	function getId(thisSquare){
	    return $(thisSquare).attr('id');
	}

	function setClickHandlers() {
	    $(".square").click(handleSquareClick);
	    $("#standard").click(initBoard);
	}

	function handleSquareClick() {
	    var that, m1, m2;
	    that = $(this);
	    m1 = that.hasClass("selectable");
	    m2 = that.hasClass("highlighted") || that.hasClass("killable");
        m3 = that.hasClass("killable");
	    if (m1) {        
	        gameBoard.selectedPiece = gameBoard.findPiece(getId(that));
	        gameBoard.highlightPieces();
	        gameBoard.selectedPiece.highlightMoves();
	    }
	    else if (m2) {
	        gameBoard.newSquare = that;
	        gameBoard.movePiece();
	    }
	    else {
	        gameBoard.selectedPiece = null;
	        gameBoard.highlightPieces();
	    }
	}

	$(document).ready(function () {
	    initBoard();
	});
	
})(window, document, jQuery);