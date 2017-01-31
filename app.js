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
            $('.square').removeClass('highlighted selectable killable selected white-pawn white-rook white-knight white-bishop white-queen white-king black-pawn black-rook black-knight black-bishop black-queen black-king')
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

            $('.square').removeClass('selectable selected highlighted killable');

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

        this.inCheck = function () {
            var pieces, i, j, killPiece;
            pieces = this.whiteTeam.concat(this.blackTeam);
            for (i = 0; i < pieces.length; i++) {
                for (j = 0; j < pieces[i].killMoves.length; j++) {
                    killPiece = gameBoard.findPiece(pieces[i].killMoves[j]);
                    if (killPiece && killPiece.rank() == 'king') {
                        return true;
                    }
                }
            }
            return false;
        }

        this.hasCheck = function (color) {
            var pieces, i, j, killPiece;
            pieces = color == 'white' ? this.whiteTeam : this.blackTeam;
            for (i = 0; i < pieces.length; i++) {
                for (j = 0; j < pieces[i].killMoves.length; j++) {
                    killPiece = gameBoard.findPiece(pieces[i].killMoves[j]);
                    if (killPiece && killPiece.rank() == 'king') {
                        return true;
                    }
                }
            }
            return false;
        }

        this.checkForWinner = function () {
            if (this.mode == 'standard') {
                if (this.rankCount('king') < 2) {
                    $('.winnerInfo').removeClass('hidden');
                    $('.winner').text(this.turn > 0 ? 'White' : 'Black');
                }
            } else {
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
            $('.black, .white').toggleClass('hidden');

            if (this.inCheck()) {
                $('.checkWarning').text('CHECK');

            } else {
                $('.checkWarning').text('');
            }
        };

        this.getLastMove = function () {
            return this.moves[this.moves.length - 1];
        };

        this.movePiece = function () {
            var capturePiece, newCol, newRow, newId;
            newId = getId(this.newSquare);
            newCol = translate(newId.split('')[0]);
            newRow = parseInt(newId.split('')[1]);

            if (this.findPiece(newId) && (this.findPiece(newId).friendly() == this.selectedPiece.enemy())) {
                capturePiece = this.findPiece(newId);
                capturePiece.square = null;
                this.removePiece(capturePiece);
                this.captured.push(capturePiece);
            }

            if (this.selectedPiece.enPassantMove && newId == this.selectedPiece.enPassantMove) {
                capturePiece = this.findPiece(this.selectedPiece.enPassantPiece);
                capturePiece.square = null;
                this.removePiece(capturePiece);
                this.captured.push(capturePiece);
                this.selectedPiece.enPassantMove = null;
                this.selectedPiece.enPassantPiece = null;
            }

            this.moves.push(new Move(this.selectedPiece.piece, this.selectedPiece.square, newId));

            this.selectedPiece.square = newId;

            if (this.selectedPiece.rank() == 'pawn' && ((this.selectedPiece.friendly() == 'white' && newRow == 8) || (this.selectedPiece.friendly() == 'black' && newRow == 1))) {
                $('.pawnPromotion').removeClass('hidden');
            } else {
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

        this.copy = function () {
            var newBoard, i;
            newBoard = new GameBoard();
            newBoard.mode = this.mode;
            newBoard.turn = this.turn;
            newBoard.selectedPiece = this.selectedPiece
            newBoard.newSquare = this.newSquare;

            for (i = 0; i < this.whiteTeam.length; i++) {
                newBoard.whiteTeam.push(this.whiteTeam[i].copy());
            }
            for (i = 0; i < this.blackTeam.length; i++) {
                newBoard.blackTeam.push(this.blackTeam[i].copy());
            }
            for (i = 0; i < this.moves.length; i++) {
                newBoard.moves.push(this.moves[i]);
            }
            for (i = 0; i < this.captured.length; i++) {
                newBoard.captured.push(this.captured[i]);
            }
            return newBoard;
        }
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
            this.killMoves = [];
            this.validMoves = [];
            switch (this.rank()) {
                case 'pawn': {
                    pawn(this);
                    break;
                }
                case 'knight': {
                    knight(this);
                    break;
                }
                case 'rook': {
                    straight(this, 8);
                    break;
                }
                case 'bishop': {
                    diagonal(this, 8);
                    break;
                }
                case 'queen': {
                    straight(this, 8);
                    diagonal(this, 8);
                    break;
                }
                case 'king': {
                    straight(this, 1);
                    diagonal(this, 1);
                    break;
                }
                default:
                    break;
            }
        };

        this.highlightMoves = function () {
            var i;
            for (i = 0; i < this.validMoves.length; i++) {
                $('#' + this.validMoves[i]).addClass('highlighted');
            }
            for (i = 0; i < this.killMoves.length; i++) {
                $('#' + this.killMoves[i]).addClass('killable');
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

    /* Initializers */

    function testPawnHit() {
        gameBoard = new GameBoard();
        gameBoard.reset('test');

        gameBoard.whiteTeam.push(new Piece('white-pawn', 'd4'));
        gameBoard.blackTeam.push(new Piece('black-pawn', 'e5'));
        gameBoard.changeTurns();
    }

    function testCheck() {
        gameBoard = new GameBoard();
        gameBoard.reset('standard');

        gameBoard.whiteTeam.push(new Piece('white-queen', 'e1'));
        gameBoard.whiteTeam.push(new Piece('white-king', 'd1'));
        gameBoard.blackTeam.push(new Piece('black-queen', 'e8'));
        gameBoard.blackTeam.push(new Piece('black-king', 'd8'));

        gameBoard.changeTurns();
    }

    function testEnPassant() {
        gameBoard = new GameBoard();
        gameBoard.reset('test');

        gameBoard.whiteTeam.push(new Piece('white-pawn', 'c4'));
        gameBoard.blackTeam.push(new Piece('black-pawn', 'd7'));

        gameBoard.whiteTeam.push(new Piece('white-pawn', 'f2'));
        gameBoard.blackTeam.push(new Piece('black-pawn', 'e5'));

        gameBoard.changeTurns();
    }

    function testPawnPromotion() {
        gameBoard = new GameBoard();
        gameBoard.reset('test');

        gameBoard.whiteTeam.push(new Piece('white-pawn', 'a7'));
        gameBoard.blackTeam.push(new Piece('black-pawn', 'h2'));

        gameBoard.changeTurns();
    }

    function initBoard() {
        gameBoard = new GameBoard();

        gameBoard.reset('standard');

        gameBoard.whiteTeam.push(new Piece('white-rook', 'a1'));
        gameBoard.whiteTeam.push(new Piece('white-rook', 'h1'));
        gameBoard.whiteTeam.push(new Piece('white-knight', 'b1'));
        gameBoard.whiteTeam.push(new Piece('white-knight', 'g1'));
        gameBoard.whiteTeam.push(new Piece('white-bishop', 'c1'));
        gameBoard.whiteTeam.push(new Piece('white-bishop', 'f1'));
        gameBoard.whiteTeam.push(new Piece('white-queen', 'e1'));
        gameBoard.whiteTeam.push(new Piece('white-king', 'd1'));

        gameBoard.whiteTeam.push(new Piece('white-pawn', 'a2'));
        gameBoard.whiteTeam.push(new Piece('white-pawn', 'b2'));
        gameBoard.whiteTeam.push(new Piece('white-pawn', 'c2'));
        gameBoard.whiteTeam.push(new Piece('white-pawn', 'd2'));
        gameBoard.whiteTeam.push(new Piece('white-pawn', 'e2'));
        gameBoard.whiteTeam.push(new Piece('white-pawn', 'f2'));
        gameBoard.whiteTeam.push(new Piece('white-pawn', 'g2'));
        gameBoard.whiteTeam.push(new Piece('white-pawn', 'h2'));

        gameBoard.blackTeam.push(new Piece('black-rook', 'a8'));
        gameBoard.blackTeam.push(new Piece('black-rook', 'h8'));
        gameBoard.blackTeam.push(new Piece('black-knight', 'b8'));
        gameBoard.blackTeam.push(new Piece('black-knight', 'g8'));
        gameBoard.blackTeam.push(new Piece('black-bishop', 'c8'));
        gameBoard.blackTeam.push(new Piece('black-bishop', 'f8'));
        gameBoard.blackTeam.push(new Piece('black-queen', 'e8'));
        gameBoard.blackTeam.push(new Piece('black-king', 'd8'));

        gameBoard.blackTeam.push(new Piece('black-pawn', 'a7'));
        gameBoard.blackTeam.push(new Piece('black-pawn', 'b7'));
        gameBoard.blackTeam.push(new Piece('black-pawn', 'c7'));
        gameBoard.blackTeam.push(new Piece('black-pawn', 'd7'));
        gameBoard.blackTeam.push(new Piece('black-pawn', 'e7'));
        gameBoard.blackTeam.push(new Piece('black-pawn', 'f7'));
        gameBoard.blackTeam.push(new Piece('black-pawn', 'g7'));
        gameBoard.blackTeam.push(new Piece('black-pawn', 'h7'));

        gameBoard.changeTurns();
	}

    function pawns() {
        gameBoard = new GameBoard();
        gameBoard.reset('pawns');

        gameBoard.whiteTeam.push(new Piece('white-pawn', 'a1'));
        gameBoard.whiteTeam.push(new Piece('white-pawn', 'h1'));
        gameBoard.whiteTeam.push(new Piece('white-pawn', 'b1'));
        gameBoard.whiteTeam.push(new Piece('white-pawn', 'g1'));
        gameBoard.whiteTeam.push(new Piece('white-pawn', 'c1'));
        gameBoard.whiteTeam.push(new Piece('white-pawn', 'f1'));
        gameBoard.whiteTeam.push(new Piece('white-pawn', 'e1'));
        gameBoard.whiteTeam.push(new Piece('white-pawn', 'd1'));

        gameBoard.whiteTeam.push(new Piece('white-pawn', 'a2'));
        gameBoard.whiteTeam.push(new Piece('white-pawn', 'b2'));
        gameBoard.whiteTeam.push(new Piece('white-pawn', 'c2'));
        gameBoard.whiteTeam.push(new Piece('white-pawn', 'd2'));
        gameBoard.whiteTeam.push(new Piece('white-pawn', 'e2'));
        gameBoard.whiteTeam.push(new Piece('white-pawn', 'f2'));
        gameBoard.whiteTeam.push(new Piece('white-pawn', 'g2'));
        gameBoard.whiteTeam.push(new Piece('white-pawn', 'h2'));

        gameBoard.blackTeam.push(new Piece('black-pawn', 'a8'));
        gameBoard.blackTeam.push(new Piece('black-pawn', 'h8'));
        gameBoard.blackTeam.push(new Piece('black-pawn', 'b8'));
        gameBoard.blackTeam.push(new Piece('black-pawn', 'g8'));
        gameBoard.blackTeam.push(new Piece('black-pawn', 'c8'));
        gameBoard.blackTeam.push(new Piece('black-pawn', 'f8'));
        gameBoard.blackTeam.push(new Piece('black-pawn', 'e8'));
        gameBoard.blackTeam.push(new Piece('black-pawn', 'd8'));

        gameBoard.blackTeam.push(new Piece('black-pawn', 'a7'));
        gameBoard.blackTeam.push(new Piece('black-pawn', 'b7'));
        gameBoard.blackTeam.push(new Piece('black-pawn', 'c7'));
        gameBoard.blackTeam.push(new Piece('black-pawn', 'd7'));
        gameBoard.blackTeam.push(new Piece('black-pawn', 'e7'));
        gameBoard.blackTeam.push(new Piece('black-pawn', 'f7'));
        gameBoard.blackTeam.push(new Piece('black-pawn', 'g7'));
        gameBoard.blackTeam.push(new Piece('black-pawn', 'h7'));

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

	function straight(thisPiece, limit) {
	    var tC, tR, lim, mods, i, j;

	    mods = [-1, 1];

	    for (i = 0; i < mods.length; i++) {
	        for (j = 0; j < mods.length; j++) {
	            tC = thisPiece.col() + mods[i];
	            tR = thisPiece.row() + mods[j];
	            lim = 1;
	            while (lim <= limit) {
	                if (checkMove(tC, thisPiece.row(), thisPiece)) {
	                    break;
	                }
	                tC += mods[i];
	                lim++;
	            }
	            lim = 1;
	            while (lim <= limit) {
	                if (checkMove(thisPiece.col(), tR, thisPiece)) { break; }
	                tR += mods[j];
	                lim++;
	            }
	        }
	    }
	}

	function diagonal(thisPiece, limit) {
	    var tC, tR, lim, mods, i, j;
	    mods = [-1, 1];
	    for (i = 0; i < mods.length; i++) {
	        for (j = 0; j < mods.length; j++) {
	            tC = thisPiece.col() + mods[i];
	            tR = thisPiece.row() + mods[j];
	            lim = 1;
	            while (lim <= limit) {
	                if (checkMove(tC, tR, thisPiece)) { break; }
	                tC += mods[i];
	                tR += mods[j];
	                lim++;
	            }
	        }
	    }
	}
	
	function pawn(thisPiece) {
	    var limit, multiplier, i, newRow, newCol, hasFriendly, hasEnemy, enPassant, sq, epsq, epPiece, lastMove, sideChecks;

	    i = 1;
	    sideChecks = [-1, 1];
	    multiplier = thisPiece.friendly() == "white" ? 1 : -1;
	    limit = ((thisPiece.friendly() == 'black' && thisPiece.row() == 7) || (thisPiece.friendly() == 'white' && thisPiece.row() == 2)) ? 2 : 1;

	    while (i <= limit) {
	        newRow = (thisPiece.row() + (i * multiplier));
	        newCol = thisPiece.col();
	        sq = translate(newCol) + newRow;
	        hasFriendly = gameBoard.findPiece(sq) && gameBoard.findPiece(sq).friendly() == thisPiece.friendly();
	        hasEnemy = gameBoard.findPiece(sq) && gameBoard.findPiece(sq).friendly() == thisPiece.enemy();

	        if (!inBounds(newRow) || hasFriendly || hasEnemy) {
	            break;
	        }else{
	            thisPiece.validMoves.push(sq);
	        }
	        i++;
	    }

	    newRow = thisPiece.row() + multiplier;
	    if (inBounds(newRow)) {
	        for (i = 0; i < sideChecks.length; i++) {
	            newCol = thisPiece.col() + sideChecks[i];
	            sq = translate(newCol) + newRow;
	            epsq = translate(newCol) + thisPiece.row()
	            hasEnemy = gameBoard.findPiece(sq) && gameBoard.findPiece(sq).friendly() == thisPiece.enemy();

	            lastMove = gameBoard.getLastMove();
	            epPiece = gameBoard.findPiece(epsq);

	            if (lastMove && epPiece) {

	                enPassant = epPiece.friendly().toString() == thisPiece.enemy().toString()
                        && thisPiece.enemy().toString() == lastMove.piece.split('-')[0].toString()
                        && epPiece.rank().toString() == lastMove.piece.split('-')[1].toString()
                        && lastMove.piece.split('-')[1].toString() == new String("pawn")
                        && lastMove.to.toString() == epsq
                        && lastMove.from.split('')[1] == (lastMove.piece.split('-')[0].toString() == 'white' ? 2 : 7)
                        && lastMove.to.split('')[1] == (lastMove.piece.split('-')[0].toString() == 'white' ? 4 : 5);
	            }

	            if (inBounds(newCol) && (hasEnemy || enPassant)) {
	                thisPiece.killMoves.push(sq);
	                if (enPassant) {
	                    thisPiece.enPassantMove = sq;
	                    thisPiece.enPassantPiece = epsq;
	                }
	            }
	        }
	    }
	}

	function knight(thisPiece) {
	    checkMove(thisPiece.col() + 2, thisPiece.row() + 1, thisPiece);
	    checkMove(thisPiece.col() + 1, thisPiece.row() + 2, thisPiece);
	    checkMove(thisPiece.col() + 2, thisPiece.row() - 1, thisPiece);
	    checkMove(thisPiece.col() + 1, thisPiece.row() - 2, thisPiece);
	    checkMove(thisPiece.col() - 2, thisPiece.row() + 1, thisPiece);
	    checkMove(thisPiece.col() - 1, thisPiece.row() + 2, thisPiece);
	    checkMove(thisPiece.col() - 2, thisPiece.row() - 1, thisPiece);
	    checkMove(thisPiece.col() - 1, thisPiece.row() - 2, thisPiece);
	}

	function checkMove(tC, tR, thisPiece) {
	    var hasFriendly, hasEnemy, illegal, sq;

	    if (inBounds(tC) && inBounds(tR)) {
	        sq = translate(tC) + tR;

	        hasFriendly = gameBoard.findPiece(sq) && gameBoard.findPiece(sq).friendly() == thisPiece.friendly();
	        hasEnemy = gameBoard.findPiece(sq) && gameBoard.findPiece(sq).friendly() == thisPiece.enemy();

	        //illegal = illegalMove(tC, tR, thisPiece);

	        if (!hasFriendly && !hasEnemy) {
	            thisPiece.validMoves.push('' + translate(tC) + tR);
	        }
	        if (hasEnemy) {
	            thisPiece.killMoves.push('' + translate(tC) + tR);
	        }
	        return hasFriendly || hasEnemy;

	    } else {
	        return false;
	    }
	}

	function illegalMove(col, row, piece) {
	    var testBoard = gameBoard.copy();
	    if (testBoard.selectedPiece) {
	        testBoard.newSquare = $('#' + translate(col) + row);
	        testBoard.movePiece();
	        return testBoard.hasCheck(piece.friendly());
	    } return false;
	}

	function promote(promotionPiece) {
	    gameBoard.selectedPiece.piece = $(promotionPiece).attr('class').replace('promotionPiece', '').trim();
	    $('.pawnPromotion').addClass('hidden');
	    gameBoard.changeTurns();
	}

	function getId(thisSquare){
	    return $(thisSquare).attr('id');
	}

	function setClickHandlers() {
	    $(".promotionPiece").click(function () {
	        promote(this);
	    });
	    $(".square").click(handleSquareClick);
	    $("#standard").click(initBoard);
	    $("#pawns").click(pawns);
	}

	function handleSquareClick() {
	    var that, m1, m2;
	    that = $(this);
	    m1 = that.hasClass("selectable");
	    m2 = that.hasClass("highlighted") || that.hasClass("killable");
	    if (m1) {
	        //$(".square").not(that).removeClass("selected highlighted killable");
	       // that.toggleClass("selected");
	        
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