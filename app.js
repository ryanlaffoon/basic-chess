(function(window, document, $, undefined){
    var mode,
        moves,
        moveNumber,
        captured,
        killMoves,
        validMoves,
        turn,
        selectedPiece,
        selectedSquare,
        selectedCol,
        selectedRow,
        newSquare;

    function initBoard() {
        mode = "standard";
        moves = [];
        captured = [];
        validMoves = [];
        killMoves = [];
        moveNumber = 1;

        $('#standard').parent().addClass("active");
        $('#pawns').parent().removeClass("active");


        removePieces($(".square"));
        clearSelection($(".square"));
		$(".square").addClass("empty");
		$("#a1, #h1").removeClass("empty").addClass("white-rook selectable");
		$("#b1, #g1").removeClass("empty").addClass("white-knight selectable");
		$("#c1, #f1").removeClass("empty").addClass("white-bishop selectable");
		$("#d1").removeClass("empty").addClass("white-king selectable");
		$("#e1").removeClass("empty").addClass("white-queen selectable");
		$("#a2, #b2, #c2, #d2, #e2, #f2, #g2, #h2").removeClass("empty").addClass("white-pawn selectable");
		$("#a8, #h8").removeClass("empty").addClass("black-rook");
		$("#b8, #g8").removeClass("empty").addClass("black-knight");
		$("#c8, #f8").removeClass("empty").addClass("black-bishop");
		$("#d8").removeClass("empty").addClass("black-king");
		$("#e8").removeClass("empty").addClass("black-queen");
		$("#a7, #b7, #c7, #d7, #e7, #f7, #g7, #h7").removeClass("empty").addClass("black-pawn");
        // 1 = white, -1 = black.
		turn = 1;
	}

    function pawns() {
        mode = "pawns";
        moves = [];
        movesDisplay = [];
        captured = [];
        validMoves = [];
        killMoves = [];
        moveNumber = 1;

        $('#standard').parent().removeClass("active");
        $('#pawns').parent().addClass("active");

	    removePieces($(".square"));
	    clearSelection($(".square"));
	    $(".square").addClass("empty");
	    $("#a1, #b1, #c1, #d1, #e1, #f1, #g1, #h1").removeClass("empty").addClass("white-pawn selectable");
	    $("#a2, #b2, #c2, #d2, #e2, #f2, #g2, #h2").removeClass("empty").addClass("white-pawn selectable");
	    $("#a7, #b7, #c7, #d7, #e7, #f7, #g7, #h7").removeClass("empty").addClass("black-pawn");
	    $("#a8, #b8, #c8, #d8, #e8, #f8, #g8, #h8").removeClass("empty").addClass("black-pawn");
        // 1 = white, -1 = black.
	    turn = 1;
    }

    function testBoard() {
        moves = [];
        movesDisplay = [];
        captured = [];
        validMoves = [];
        killMoves = [];
        moveNumber = 1;
        removePieces($(".square"));
        $(".square").toggleClass("empty");
        $("#c7").toggleClass("white-pawn selectable empty");
        $("#e2").toggleClass("black-pawn empty");
        // 1 = white, -1 = black.
        turn = 1;

    }

	function getPieceClass(classValue) {
		return (classValue
		.replace('square','')
		.replace('selected','')
		.replace('highlighted', '')
        .replace('selectable', '')
        .replace('killable', '')
        .replace('promotionPiece', '')
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

	function pawnPromotion() {
	    $('.pawnPromotion').removeClass('hidden');
	    $('.square').removeClass('selectable');
	}

	function promote(newPiece) {
	    //removePieces(selectedSquare);
	    removePieces(newSquare);
	    newSquare.addClass(newPiece);
	    $('.pawnPromotion').addClass('hidden');
	    changeTurns();
	}

	function castle(kingSpace, rookSpace) {
	    // To Do
	    // King must not have moved
	    // This rook must not have moved
        // Free spaces between the two
	}

	function enPassant() {
        // To Do
	}

	function getId(thisSquare){
	    return $(thisSquare).attr('id');
	}

	function movePiece(/*piece, oldSquare, newSquare*/) {
	    var friendly, enemy, rank, capturePiece, hasEnemy, oldCol, newCol, oldRow, newRow;
	   // newSquare = $('#' + translate(newCol) + newRow);
	    friendly = selectedPiece.split('-')[0];
	    rank = selectedPiece.split('-')[1];
	    enemy = getEnemyColor(friendly);
	    hasEnemy = hasPiece(newSquare, enemy);

	    oldCol = translate(getId(selectedSquare).split('')[0]);
	    oldRow = parseInt(getId(selectedSquare).split('')[1]);
	    newCol = translate(getId(newSquare).split('')[0]);
	    newRow = parseInt(getId(newSquare).split('')[1]);

	    if (hasEnemy) {
	        capturePiece = getPieceClass(newSquare.attr('class'));
	        captured.push('<span class="' + capturePiece + ' displayOnly"></span>');
	    }

	    removePieces(selectedSquare);
	    removePieces(newSquare);
	    newSquare.removeClass("empty highlighted selected").addClass(selectedPiece);
	    $('.square').removeClass("highlighted selectable killable selected");
	    moves.push('<div><span>' + moveNumber + '</span> <span class="' + selectedPiece + ' displayOnly"></span> ' + translate(oldCol) + oldRow + ' ' + translate(newCol) + newRow + '</div>');

	    updateMessage();
	    moveNumber++;

	    if (rank == 'pawn') {
	        if ((friendly == 'white' && newRow == 8) || (friendly == 'black' && newRow == 1)) {
	            pawnPromotion(newSquare);
	        } else {
	            changeTurns();
	        }
	    } else {

	        changeTurns();
	    }

	}

	function changeTurns() {
	    var color;

	    turn = turn * -1;

	    color = turn > 0 ? "white" : "black";

	    $('.square').removeClass('selectable');
	    if (turn > 0) {
	        $('.white-pawn, .white-rook, .white-knight, .white-bishop, .white-queen, .white-king').not('.promotionPiece, .displayOnly').addClass('selectable');
	    }
	    else {
	        $('.black-pawn, .black-rook, .black-knight, .black-bishop, .black-queen, .black-king').not('.promotionPiece, .displayOnly').addClass('selectable');
	    }

	    $('.nextTurn').text(titleCase(color))
	    $('.' + color).toggleClass('hidden');
	    $('.' + getEnemyColor(color)).toggleClass('hidden');
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
		row = parseInt(square.split('')[1]);

		if (colorPiece) {
		    selectedPiece = colorPiece;
		    selectedSquare = $('#' + square);
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
	    var mD = moves.slice();
	    var cD = captured.slice();
	    $('.moves-list').html(mD.reverse());
	    $('.captured-list').html(cD.reverse());
	}
	
	function clearSelection(selection) {
	    $(selection).removeClass("selected highlighted killable");
	}

	function handleSquareClick() {
	    var that;
	    that = this;
	    if ($(that).hasClass("selectable")) {
	        clearSelection($(".square").not(that));
	        $(that).toggleClass("selected");
	        checkSquare(that);
	    }
	    if ($(that).hasClass("highlighted") || $(that).hasClass("killable")) {
	        newSquare = $(that);
	        movePiece();
	    }
	}

	$(document).ready(function () {

	    initBoard();
	    //pawns();



	    $("#standard").click(function () {
	        initBoard();
	    })

		$("#pawns").click(function () {
		    pawns();
		})

		$(".promotionPiece").click(function () {
		    promote(getPieceClass($(this).attr('class')));
		})

		$(".square").click( handleSquareClick );
	});
	
})(window, document, jQuery);