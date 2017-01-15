(function(window, document, $, undefined){
    var moves,
        turn,
        selectedPiece,
        selectedSquare,
        selectedCol,
        selectedRow;

    function Move() {

    }

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
	    $("#d5").toggleClass("white-knight empty");
	    $("#e4").toggleClass("black-knight empty");
    }

	function getPieceClass(classValue) {
		return (classValue
		.replace('square','')
		.replace('selected','')
		.replace('highlighted', '')
        .replace('selectable', '')
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

	function straight(col, row, limit) {
	    var tC, tR, lim, validSpaces;
	    validSpaces = [];
	    tC = col;
	    tR = row;
	    lim = 0;
	    while (inBounds(tC) && lim <= limit) {
	        validSpaces.push('' + translate(tC) + tR);
	        tC++;
	        lim++;
	    }
	    tC = col;
	    tR = row;
	    lim = 0;
	    while (inBounds(tC) && lim <= limit) {
	        validSpaces.push('' + translate(tC) + tR);
	        tC--;
	        lim++;
	    }
	    tC = col;
	    tR = row;
	    lim = 0;
	    while (inBounds(tR) && lim <= limit) {
	        validSpaces.push('' + translate(tC) + tR);
	        tR++;
	        lim++;
	    }
	    tC = col;
	    tR = row;
	    lim = 0;
	    while (inBounds(tR) && lim <= limit) {
	        validSpaces.push('' + translate(tC) + tR);
	        tR--;
	        lim++;
	    }
	    return validSpaces;
	}

	function diagonal(col, row, limit) {
	    var tC, tR, lim, validSpaces;

	    validSpaces = [];
	    tC = col;
	    tR = row;
	    lim = 0;
	    while (inBounds(tC) && inBounds(tR) && lim <= limit) {
	        validSpaces.push('' + translate(tC) + tR);
	        tC++;
	        tR++;
	        lim++;
	    }
	    tC = col;
	    tR = row;
	    lim = 0;
	    while (inBounds(tC) && inBounds(tR) && lim <= limit) {
	        validSpaces.push('' + translate(tC) + tR);
	        tC--;
	        tR--;
	        lim++;
	    }
	    tC = col;
	    tR = row;
	    lim = 0;
	    while (inBounds(tC) && inBounds(tR) && lim <= limit) {
	        validSpaces.push('' + translate(tC) + tR);
	        tC++;
	        tR--;
	        lim++;
	    }
	    tC = col;
	    tR = row;
	    lim = 0;
	    while (inBounds(tC) && inBounds(tR) && lim <= limit) {
	        validSpaces.push('' + translate(tC) + tR);
	        tC--;
	        tR++;
	        lim++;
	    }
	    return validSpaces;
	}
	
	function pawn(col, row, color) {
	    // If at starting rank, allow 2. Otherwise 1.

	    var limit, multiplier, validSpaces;
	    validSpaces = [];

	    limit = ((color == 'black' && row == 7) || (color == 'white' && row == 2)) ? 2 : 1;
	    switch (color) {
	        case 'white':
	            multiplier = 1;
	            break;
	        default:
	            multiplier = -1;
	            break;
	    }
	    for (var i = 1; i <= limit; i++) {
	        var newRow = (parseInt(row) + (i * multiplier));
	        if (inBounds(newRow)) {
	            validSpaces.push('' + translate(col) + newRow);
	        }
	    }

	    return validSpaces;
	    // Enemy check needed...
	}

	function knight(col, row) {
	    var tC, tR, validSpaces;

	    validSpaces = [];
	    row = parseInt(row);
	    tC = col + 2;
	    tR = row + 1;
	    if (inBounds(tC) && inBounds(tR)) {
	        validSpaces.push('' + translate(tC) + tR);
	    }
	    tC = col + 1;
	    tR = row + 2;
	    if (inBounds(tC) && inBounds(tR)) {
	        validSpaces.push('' + translate(tC) + tR);
	    }
	    tC = col + 2;
	    tR = row - 1;
	    if (inBounds(tC) && inBounds(tR)) {
	        validSpaces.push('' + translate(tC) + tR);
	    }
	    tC = col + 1;
	    tR = row - 2;
	    if (inBounds(tC) && inBounds(tR)) {
	        validSpaces.push('' + translate(tC) + tR);
	    }
	    tC = col - 2;
	    tR = row + 1;
	    if (inBounds(tC) && inBounds(tR)) {
	        validSpaces.push('' + translate(tC) + tR);
	    }
	    tC = col - 1;
	    tR = row + 2;
	    if (inBounds(tC) && inBounds(tR)) {
	        validSpaces.push('' + translate(tC) + tR);
	    }
	    tC = col - 2;
	    tR = row - 1;
	    if (inBounds(tC) && inBounds(tR)) {
	        validSpaces.push('' + translate(tC) + tR);
	    }
	    tC = col - 1;
	    tR = row - 2;
	    if (inBounds(tC) && inBounds(tR)) {
	        validSpaces.push('' + translate(tC) + tR);
	    }
	    return validSpaces;
	}

	function removePieces(thisSquare) {
	    $(thisSquare).removeClass("white-pawn white-rook white-knight white-bishop white-queen white-king black-pawn black-rook black-knight black-bishop black-queen black-king");
	}

	function movePiece(piece, oldCol, oldRow, newCol, newRow) {
	    removePieces($('#' + selectedSquare));
	    $('#' + translate(newCol) + newRow).toggleClass("empty highlighted selected " + selectedPiece);
	    changeTurns();
        // Add logging...
	}

	function changeTurns() {
	    $('.white-pawn, .white-rook, .white-knight, .white-bishop, .white-queen, .white-king, .black-pawn, .black-rook, .black-knight, .black-bishop, .black-queen, .black-king').toggleClass('selectable');
	}

	function checkSquare(thisSquare){
		var colorPiece,
		color,
		piece,
		square,
		col,
		row,
		validSpaces;
		
		colorPiece = getPieceClass($(thisSquare).attr('class')).replace('empty','');
		square = $(thisSquare).attr('id');

        // Columns are Alpha, Translate for easy movement.
		col = translate(square.split('')[0]);

        // Row is always numeric
		row = square.split('')[1];

		if (colorPiece) {
		    selectedPiece = colorPiece;
		    selectedSquare = square;
		    selectedCol = col;
            selectedRow = row;
			validSpaces = [];
			
			color = colorPiece.split('-')[0];
			piece = colorPiece.split('-')[1];

			switch(piece){
			    case 'pawn': {
			        validSpaces = pawn(col, row, color);
					break;
				}
			    case 'knight': {
			        validSpaces = knight(col, row);
			        break;
			    }
			    case 'rook': {
			        validSpaces = straight(col, row, 8);
			        break;
			    }
			    case 'bishop': {
			        validSpaces = diagonal(col, row, 8);
			        break;
			    }
			    case 'queen': {
			        validSpaces = straight(col, row, 8).concat(diagonal(col, row, 8));
			        break;
			    }
			    case 'king': {
			        validSpaces = straight(col, row, 1).concat(diagonal(col, row, 1));
			        break;
			    }
			    default:
					break;
			}
		    // Highlight valid moves
			validSpaces.forEach(function (value) {
			    //Check for frienemies here?
			    $('#' + value).not(square).toggleClass("highlighted selectable");
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

	function toggleSelectedMessage(square) {
		if($(square).hasClass('selected')){			
			$(".selectedMessage").text(function(){
				return '[' + $(square).attr('id') + '] (' + getPieceClass($(square).attr('class')) + ')';
			});
		}else{
			$(".selectedMessage").text(function(){
				return '';
			});
		}
	}
	
	$(document).ready(function () {

		initBoard();
		moves = [];
        // 1 = white, -1 = black.
		turn = 1;
		//testBoard();

	    //Need a way to track moves, White is first, so a counter starting at 1,
	    //Odd values are white moves, Even black...
        //Only playable spaces should be clickable.

	    /*
        Legacy stuff here, allows anyone to move anything at any time... 
        we need to be able to toggle the selectability
        */
		$(".square")
		.click( function() {
		    var that,
                selected,
		        highlighted;

		    that = this;
		    highlighted = $(that).hasClass("highlighted");

		    if ($(that).hasClass("selectable")) {
			    $(".square").not(that).removeClass("selected").removeClass("highlighted");
			    $(that).toggleClass("selected");
			    toggleSelectedMessage(that);
			    checkSquare(that);
			}

			if (highlighted) {
			    var nC, nR;
			    nC = translate($(that).attr('id').split('')[0]);
			    nR = parseInt($(that).attr('id').split('')[1]);
			    movePiece(selectedPiece, selectedCol, selectedRow, nC, nR);
			}
		});
	});
	
})(window, document, jQuery);