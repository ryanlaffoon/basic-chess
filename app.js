(function(window, document, $, undefined){
	
	function Square(id, piece) {
		this.id = id;
		this.piece = piece;
		this.getRow = function () {
			return this.id.split('')[2];
		};
		this.getCol = function () {
			return this.getRowNumber(this.id.split('')[1]); 
		}
		this.getRowNumber = function(rowLetter) {
			switch(rowLetter){
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
			}
		}
	}
	
	function initBoard() {
		$(".square").toggleClass("empty");
		$("#a1, #h1").toggleClass("white-rook empty");
		$("#b1, #g1").toggleClass("white-knight empty");
		$("#c1, #f1").toggleClass("white-bishop empty");
		$("#d1").toggleClass("white-king empty");
		$("#e1").toggleClass("white-queen empty");
		$("#a2, #b2, #c2, #d2, #e2, #f2, #g2, #h2").toggleClass("white-pawn empty");
		$("#a8, #h8").toggleClass("black-rook empty");
		$("#b8, #g8").toggleClass("black-knight empty");
		$("#c8, #f8").toggleClass("black-bishop empty");
		$("#d8").toggleClass("black-king empty");
		$("#e8").toggleClass("black-queen empty");
		$("#a7, #b7, #c7, #d7, #e7, #f7, #g7, #h7").toggleClass("black-pawn empty");
	}

	function getPieceClass(classValue) {
		return titleCase(classValue
		.replace('square','')
		.replace('selected','')
		.replace('highlighted','')
		.replace('-',' ')
		.trim());
	}
	
	function highlightValidMoves(thisSquare) {
		
	}
	
	function checkSquare(thisSquare){
		var colorPiece,
		color,
		piece,
		square,
		col,
		row,
		validSpaces,
		multiplier;
		
		colorPiece = getPieceClass($(thisSquare).attr('class')).replace('Empty','');
		square = $(thisSquare).attr('id');
		col = square.split('')[0];
		row = square.split('')[1];
		if(colorPiece){
			validSpaces = [];
			
			color = colorPiece.split(' ')[0];
			piece = colorPiece.split(' ')[1];
			/*
			$(".colorMessage").text(function(){
				return color;
			});
			$(".pieceMessage").text(function(){
				return piece;
			});
			*/
			switch(color){
				case 'White':
					multiplier = 1;
					break;
				default:
					multiplier = -1;
					break;
			}
			
			switch(piece){
				case 'Pawn':{
					for(var i = 1; i <= 2; i++){
						validSpaces.push('' + col + (parseInt(row) + (i * multiplier)));
					}
					/*
					$(".validSpacesMessage").text(function(){
						return validSpaces;
					});*/
					validSpaces.forEach(function (value) {
						$('#' + value).toggleClass("highlighted");
					});
					break;
				}
				default:
					/*$(".validSpacesMessage").text(function(){
						return '';
					});*/
					break;
			}
		}
		else{
			$(".colorMessage").text(function(){
				return '';
			});
			$(".pieceMessage").text(function(){
				return '';
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
	
	$(document).ready(function() {
		initBoard();
		
		$(".square")
		.click( function() {
			var that = this;
			
			// Highlight Square
			$(".square").not(that).removeClass("selected highlighted");
			$(that).toggleClass("selected");
			
			// Update Selected Message
			toggleSelectedMessage(that);
			
			// Calculate Moves
			checkSquare(that);
		});
	});
	
})(window, document, jQuery);