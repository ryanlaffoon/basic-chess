(function(window, document, $, undefined){
    var moves,
        captured,
        killMoves,
        validMoves,
        turn,
        selectedPiece,
        selectedSquare,
        selectedCol,
        selectedRow;

	function initBoard() {
		$(".square").toggleClass("empty");
		$("#a1, #h1").toggleClass("white-rook selectable empty");
		$("#b1, #g1").toggleClass("white-knight selectable empty");
		$("#c1, #f1").toggleClass("white-bishop selectable empty");
		$("#d1").toggleClass("white-king selectable empty");
		$("#e1").toggleClass("white-queen selectable empty");
		$("#a2, #b2, #c2, #d2, #e2, #f2, #g2, #h2").toggleClass("white-pawn selectable empty");
		$("#a8, #h8").toggleClass("black-rook empty");
		$("#b8, #g8").toggleClass("black-knight empty");
		$("#c8, #f8").toggleClass("black-bishop empty");
		$("#d8").toggleClass("black-king empty");
		$("#e8").toggleClass("black-queen empty");
		$("#a7, #b7, #c7, #d7, #e7, #f7, #g7, #h7").toggleClass("black-pawn empty");
	}

	function testBoard() {
	    $(".square").toggleClass("empty");
	    $("#d5").toggleClass("white-bishop selectable empty");
	    $("#e4").toggleClass("black-rook empty");
    }

	function getPieceClass(classValue) {
		return (classValue
		.replace('square','')
		.replace('selected','')
		.replace('highlighted', '')
        .replace('selectable', '')
        .replace('killable', '')
		.trim());
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
    
	function hasPiece(thisSquare, color) {
	    return ($(thisSquare).hasClass(color + '-pawn') ||
            $(thisSquare).hasClass(color + '-rook') ||
            $(thisSquare).hasClass(color + '-knight') ||
            $(thisSquare).hasClass(color + '-bishop') ||
            $(thisSquare).hasClass(color + '-queen') ||
            $(thisSquare).hasClass(color + '-king'));
	}

	function straight(col, row, color, limit) {
	    var tC, tR, lim, friendly, enemy;

	    row = parseInt(row);
	    lim = 1;
	    friendly = color;
	    enemy = getEnemyColor(friendly);

	    tC = col + 1;
	    tR = row;
	    while (inBounds(tC) && lim <= limit) {
	        if (checkMove(tC, tR, friendly, enemy)) { break; }
	        tC++;
	        lim++;
	    }
	    tC = col - 1;
	    tR = row;
	    lim = 1;
	    while (inBounds(tC) && lim <= limit) {
	        if (checkMove(tC, tR, friendly, enemy)) { break; }
	        tC--;
	        lim++;
	    }
	    tC = col;
	    tR = row + 1;
	    lim = 1;
	    while (inBounds(tR) && lim <= limit) {
	        if (checkMove(tC, tR, friendly, enemy)) { break; }
	        tR++;
	        lim++;
	    }
	    tC = col;
	    tR = row - 1;
	    lim = 1;
	    while (inBounds(tR) && lim <= limit) {
	        if (checkMove(tC, tR, friendly, enemy)) { break; }
	        tR--;
	        lim++;
	    }
	}

	function diagonal(col, row, color, limit) {
	    var tC, tR, lim, friendly, enemy;

	    row = parseInt(row);
	    tC = col + 1;
	    tR = row + 1;
	    lim = 1;
	    friendly = color;
	    enemy = getEnemyColor(friendly);

	    while (inBounds(tC) && inBounds(tR) && lim <= limit) {
	        if (checkMove(tC, tR, friendly, enemy)) { break; }
	        tC++;
	        tR++;
	        lim++;
	    }
	    tC = col - 1;
	    tR = row - 1;
	    lim = 1;
	    while (inBounds(tC) && inBounds(tR) && lim <= limit) {
	        if (checkMove(tC, tR, friendly, enemy)) { break; }
	        tC--;
	        tR--;
	        lim++;
	    }
	    tC = col + 1;
	    tR = row - 1;
	    lim = 1;
	    while (inBounds(tC) && inBounds(tR) && lim <= limit) {
	        if (checkMove(tC, tR, friendly, enemy)) { break; }
	        tC++;
	        tR--;
	        lim++;
	    }
	    tC = col - 1;
	    tR = row + 1;
	    lim = 1;
	    while (inBounds(tC) && inBounds(tR) && lim <= limit) {
	        if (checkMove(tC, tR, friendly, enemy)) { break; }
	        tC--;
	        tR++;
	        lim++;
	    }
	}
	
	function pawn(col, row, color) {
	    var limit, multiplier, friendly, enemy, i;
	    row = parseInt(row);
	    i = 1;
	    friendly = color;
	    enemy = getEnemyColor(friendly);
	    multiplier = friendly == "white" ? 1 : -1;
	    limit = ((friendly == 'black' && row == 7) || (friendly == 'white' && row == 2)) ? 2 : 1;

	    while (i <= limit) {
	        var newRow, hasFriendly, hasEnemy;

	        newRow = (row + (i * multiplier));
            hasFriendly = hasPiece($('#' + translate(col) + newRow), friendly);
            hasEnemy = hasPiece($('#' + translate(col) + newRow), enemy);

            if (hasFriendly || hasEnemy || !inBounds(newRow)) {
	            break;
	        }
	        validMoves.push('' + translate(col) + newRow);
            i++
	    }

	    if (inBounds(row + multiplier) && inBounds(col + 1) && hasPiece($('#' + translate(col + 1) + (row + multiplier)), enemy)) {
	        killMoves.push(translate(col + 1) + (row + multiplier));
	    }
	    if (inBounds(row + multiplier) && inBounds(col - 1) && hasPiece($('#' + translate(col - 1) + (row + multiplier)), enemy)) {
	        killMoves.push(translate(col - 1) + (row + multiplier));
	    }
	}

	function knight(col, row, color) {
	    var friendly, enemy;

	    row = parseInt(row);
	    friendly = color;
	    enemy = getEnemyColor(friendly);

	    checkMove(col + 2, row + 1, friendly, enemy);
	    checkMove(col + 1, row + 2, friendly, enemy);
	    checkMove(col + 2, row - 1, friendly, enemy);
	    checkMove(col + 1, row - 2, friendly, enemy);
	    checkMove(col - 2, row + 1, friendly, enemy);
	    checkMove(col - 1, row + 2, friendly, enemy);
	    checkMove(col - 2, row - 1, friendly, enemy);
	    checkMove(col - 1, row - 2, friendly, enemy);
	}

	function checkMove(tC, tR, friendly, enemy) {
	    var hasFriendly, hasEnemy;

	    hasFriendly = hasPiece($('#' + translate(tC) + tR), friendly);
	    hasEnemy = hasPiece($('#' + translate(tC) + tR), enemy);

	    if (inBounds(tC) && inBounds(tR)) {
            
	        if (!hasFriendly && !hasEnemy) {
	            validMoves.push('' + translate(tC) + tR);
	            return false;
	        }
	        if (hasEnemy) {
	            killMoves.push('' + translate(tC) + tR);
	            return true;
	        }
	        if (hasFriendly) {
	            return true;
	        }
	    }
	}

	function removePieces(thisSquare) {
	    $(thisSquare).removeClass("white-pawn white-rook white-knight white-bishop white-queen white-king black-pawn black-rook black-knight black-bishop black-queen black-king");
	}

	function getEnemyColor(friendly){
	    return friendly == "white" ? "black" : "white";
	}

	function movePiece(piece, oldCol, oldRow, newCol, newRow) {
	    var friendly, enemy, newSquare, capturePiece, hasEnemy;
	    newSquare = $('#' + translate(newCol) + newRow);
	    friendly = piece.split('-')[0];
	    enemy = getEnemyColor(friendly);

	    hasEnemy = hasPiece(newSquare, enemy);

	    if (hasEnemy) {
	        capturePiece = getPieceClass(newSquare.attr('class'));
	        captured.push('<span class="' + capturePiece + '"></span>');
	    }
	    removePieces($('#' + selectedSquare));
	    removePieces(newSquare);
	    newSquare.removeClass("empty highlighted selected").addClass(selectedPiece);
	    $('.square').removeClass("highlighted selectable killable selected");
	    moves.push('<div><span class="' + piece + '"></span> ' + translate(oldCol) + oldRow + ' ' + translate(newCol) + newRow + '</div>');

	    changeTurns();
	    updateMessage();
	}

	function changeTurns() {
	    turn = turn * -1;
	    $('.square').removeClass('selectable');
	    if (turn > 0) {
	        $('.white-pawn, .white-rook, .white-knight, .white-bishop, .white-queen, .white-king').addClass('selectable');
	    }
	    else {
	        $('.black-pawn, .black-rook, .black-knight, .black-bishop, .black-queen, .black-king').addClass('selectable');
	    }
	}

	function checkSquare(thisSquare){
		var colorPiece,
		color,
		piece,
		square,
		col,
		row;
		
		validMoves = [];
		killMoves = [];
		colorPiece = getPieceClass($(thisSquare).attr('class')).replace('empty','');
		square = $(thisSquare).attr('id');

		col = translate(square.split('')[0]);
		row = square.split('')[1];

		if (colorPiece) {
		    selectedPiece = colorPiece;
		    selectedSquare = square;
		    selectedCol = col;
            selectedRow = row;
			
			color = colorPiece.split('-')[0];
			piece = colorPiece.split('-')[1];

			$('.empty').removeClass("selectable");
			switch(piece){
			    case 'pawn': {
			        pawn(col, row, color);
					break;
				}
			    case 'knight': {
			        knight(col, row, color);
			        break;
			    }
			    case 'rook': {
			        straight(col, row, color, 8);
			        break;
			    }
			    case 'bishop': {
			        diagonal(col, row, color, 8);
			        break;
			    }
			    case 'queen': {
			        straight(col, row, color, 8);
			        diagonal(col, row, color, 8);
			        break;
			    }
			    case 'king': {
			        straight(col, row, color, 1);
			        diagonal(col, row, color, 1);
			        break;
			    }
			    default:
					break;
			}
			validMoves.forEach(function (value) {
			    $('#' + value).not(square).addClass("highlighted selectable");
			});
			killMoves.forEach(function (value) {
			    $('#' + value).not(square).addClass("killable");
			});
		}       
	}

	function titleCase(str) {
		str = str.toLowerCase().split(' ');
		for(var i = 0; i < str.length; i++){
		  str[i] = str[i].split('');
		  str[i][0] = str[i][0].toUpperCase();
		  str[i] = str[i].join('');
		}
		return str.join(' ');
	}

	function updateMessage() {
	    $('.moves').html(moves.reverse());
	    $('.captured').html(captured.reverse());
	}
	
	$(document).ready(function () {
		initBoard();
		moves = [];
		captured = [];
		validMoves = [];
		killMoves = [];
        // 1 = white, -1 = black.
		turn = 1;

		$(".square")
		.click( function() {
		    var that,
                selected,
		        highlighted;

		    that = this;
		    highlighted = $(that).hasClass("highlighted");
		    killable = $(that).hasClass("killable");
		    if ($(that).hasClass("selectable")) {
		        $(".square").not(that).removeClass("selected").removeClass("highlighted").removeClass("killable");
			    $(that).toggleClass("selected");
			    checkSquare(that);
			}

			if (highlighted || killable) {
			    var nC, nR;
			    nC = translate($(that).attr('id').split('')[0]);
			    nR = parseInt($(that).attr('id').split('')[1]);
			    movePiece(selectedPiece, selectedCol, selectedRow, nC, nR);
			}
		});
	});
	
})(window, document, jQuery);