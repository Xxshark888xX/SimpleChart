setTimeout(function() {
	var commentLabel = $("label[class='chart-node-comment-tandru']");
	var chart = document.getElementById("chart");
	var container = $("div[class='chart-wrapper-tandru']");
	var ctx = chart.getContext("2d");

	// CHART DYNAMIC DIMENSIONS //

	chart.width = container.width() - 30;
	chart.height = container.height() + 150;
	chart.style.marginTop = ((-chart.height / 2) + (container.height() / 2) - 60) + 'px';
	chart.style.marginLeft = (-chart.width / 2) + (container.width() / 2) + "px";
			 
	var cw = chart.width,
		ch = chart.height,
		cx = cw / 2,
		cy = ch - 70,
		rad = Math.PI / 180,
		frames = 0;

	// CHART STYLE //

	var cAnimationSpeed = 1,
		cWallBounceSpeed = 2,
		cWallBounceForce = 20,
		cContainerBackgroundColor = "#282f4b",
		cBottomLabelLineColor = "#999",
		cBottomLabelLineWidth = 1,
		cBottomLabelTextColor = "#ccc",
		cBottomLabelTextFont = "14px monospace",
		
		cLineColor = "rgba(118, 75, 120, 1)",
		cLineDotTextColor = "#d096d4",
		cLineDotColor = "#d096d4",
		cFillingGrad0 = "hsla(297, 23%, 38%, 1)",
		cFillingGrad1 = "hsla(323, 52%, 51%, 0)",
		cFillingGradx0 = 0,
		cFillingGrady0 = 0,
		cFillingGradx1 = 0,
		cFillingGrady1 = cy,  // Do not edit
		
		cNotesLabelBgColor = "rgba(255, 255, 255, .8)",
		cNotesLabelTextColor = "#333",
		cNotesLabelBorderRadius = "5%",
		cHNodesSteps = 80;
		
	container.css("background-color", cContainerBackgroundColor);

	commentLabel.css("background-color", cNotesLabelBgColor);
	commentLabel.css("color", cNotesLabelTextColor);
	commentLabel.css("border-radius", cNotesLabelBorderRadius);


	var chartFilling = 
		  ctx.createLinearGradient(
		  cFillingGradx0,
		  cFillingGrady0,
		  cFillingGradx1,
		  cFillingGrady1);

	chartFilling.addColorStop(0, cFillingGrad0);
	chartFilling.addColorStop(1, cFillingGrad1);

	/////////////////////////////////////////////////////

	// DATA // 
	
	function sortByKey(array, key) {
		return array.sort(function(a, b) {
			var x = a[key]; var y = b[key];
			return ((x < y) ? -1 : ((x > y) ? 1 : 0));
		});
	}

	var cData = _DATA_.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

	/////////////////////////////////////////////////////

	document.getElementById("add").addEventListener("click", function() {
		var date = document.getElementById("date").value;
		var score = document.getElementById("note").value;
		var title = document.getElementById("title").value;
		var comm = document.getElementById("comment").value;

		appendData({ 'score': parseInt(score), 'date': date, 'notes': { 'title': title, 'description': comm } });
	});

	var vData = 4,
		cOffsetX = 50,
		cOffsetY = 50,
		chartHeight = ch - 2 * cOffsetY,
		chartWidth = cw - 2 * cOffsetX,
		cCurvature = 1 / 7,
		speed = cAnimationSpeed;

	var A = {
	  x: cOffsetX,
	  y: cOffsetY + chartHeight
	}
	var B = {
	  x: (cOffsetX + chartWidth),
	  y: cOffsetY + chartHeight
	}
	
	var valuesRy = [], propsRy = [];

	// horizontal (A - B) //
	var oNodesVal = [],
		oDots = [],
		oFlat = [],
		cFirstInit = true,
		cHStep = cHNodesSteps,
	// vertical (A - B) //
		aStep = (chartHeight - 50) / (vData);
		Max = 0,
		Min = 0,
		aStepValue = 0,
		verticalUnit = 0;
	
	
	loadData();
	
	/////////////////////////////////////////////////////
	
	function appendData(d) {
		cData.push(d);
		
		valuesRy.push(d.score);
		propsRy.push(d.date);
		
		calcVUnit();

		if (oNodesVal.length >= 2)
			var cHorizontalStep = oNodesVal[1].x - oNodesVal[0].x;
		else
			var cHorizontalStep = (chartWidth / (cData.length + 1)) + cHStep;
		
		var oNLen = oNodesVal.length - 1;
		
		oNodesVal.push({
			x: oNodesVal[oNLen].x + cHorizontalStep,
			y: oNodesVal[oNLen].y,
			val: propsRy[propsRy.length - 1]
		});
		
		oNLen++;
		
		oDots.push({
			x: oNodesVal[oNLen].x,
			y: oNodesVal[oNLen].y - d.score * verticalUnit - 25,
			val: d.score
		});
		
		oFlat.push({
			x: oNodesVal[oNLen].x,
			y: oDots[oNLen].y //oNodesVal[oNLen].y - 25
		});
	}
	
	/////////////////////////////////////////////////////
	
	function loadData() {
		loadPredata();
		
		loadFinalData();
	}
	
	function loadPredata() {
		// Values and label //
		for (var i = 0, l = cData.length; i < l; i++) {
			var cDay = cData[i];
			
			valuesRy.push(cDay.score);
			propsRy.push(cDay.date);
		}
		
		calcVUnit();
	}
	
	function loadFinalData() {
		oDots = [];
		oFlat = [];
		oNodesVal = [];

		var cHorizontalStep = (chartWidth / (cData.length + 1)) + cHStep;
		
		for (var i = 0; i < cData.length; i++) {
			var cDay = cData[i];
			
			if (i == 0) {
				oNodesVal[i] = {
					x: A.x,
					y: A.y,
					val: propsRy[0]};
			} else {
				oNodesVal[i] = {}
				oNodesVal[i].x = oNodesVal[i - 1].x + cHorizontalStep;
				oNodesVal[i].y = oNodesVal[i - 1].y;
				oNodesVal[i].val = propsRy[i];
			}
			
			
			oDots[i] = {};
			oFlat[i] = {};

			oDots[i].x = oNodesVal[i].x;
			oFlat[i].x = oNodesVal[i].x;

			oDots[i].y = oNodesVal[i].y - cDay.score * verticalUnit - 25;
			oFlat[i].y = oNodesVal[i].y - 25;

			oDots[i].val = cDay.score;
		}
	};
	
	function calcVUnit() {
		Max = Math.ceil(arrayMax(valuesRy) / 10) * 10,
		Min = Math.floor(arrayMin(valuesRy) / 10) * 10,
		aStepValue = (Max - Min) / (vData),
		verticalUnit = aStep / aStepValue;
	}
		
	/////////////////////////////////////////////////////


	/* DRAWING */

	function drawCoords() {
		var offX = 0,
			offY = 3;
		
		ctx.clearRect(0, chartHeight + 45, chart.width, chart.height);

		// HORIZONTAL LINE //
		ctx.textAlign = "center";
		ctx.textBaseline = "hanging";
		ctx.lineWidth = cBottomLabelLineWidth;
		ctx.strokeStyle = cBottomLabelLineColor;
		ctx.fillStyle = cBottomLabelTextColor;
		ctx.font = cBottomLabelTextFont;
			
		ctx.beginPath();
		ctx.lineTo(A.x - 60, A.y);
		ctx.lineTo(B.x + 60, B.y);
		ctx.stroke();
		for (var i = 0; i < cData.length; i++) {	
			// LABELS //
			ctx.beginPath();
			ctx.moveTo((oNodesVal[i].x - offX) + cSlideX, oNodesVal[i].y - offY);
			ctx.lineTo((oNodesVal[i].x + offX) + cSlideX, oNodesVal[i].y + offY);
			ctx.stroke();

			ctx.fillText(oNodesVal[i].val, (oNodesVal[i].x - 2 * offX) + cSlideX, oNodesVal[i].y + 2 * offY);
		}
	}

	function drawChart() {
		ctx.clearRect(0, 0, chart.width, chart.height - 45);
		cAnimReqId = window.requestAnimationFrame(drawChart);
		
		if (cFirstInit) {
			frames += speed;
	  
			for (var i = 0; i < oFlat.length; i++) {
				if (oFlat[i].y > oDots[i].y)
					oFlat[i].y -= speed;
			}

			if (frames >= Max * verticalUnit)
				cFirstInit = false;
		}
		
		drawCurve(oFlat);
		drawCoords();
		drawNodes();
	}
	cAnimReqId = window.requestAnimationFrame(drawChart);

	function drawNodes() {
		for (var i = 0; i < oFlat.length; i++) {
		  // NODES VALUE //
		  ctx.beginPath();
		  ctx.fillStyle = cLineDotTextColor;
		  ctx.fillText(oDots[i].val, oFlat[i].x + cSlideX, oFlat[i].y - 25);
		  
		  // NODES //
		  ctx.beginPath();
		  ctx.fillStyle = cLineDotColor;
		  ctx.arc(oFlat[i].x + cSlideX, oFlat[i].y, 4, 0, 2 * Math.PI);
		  ctx.fill();
		}
	}

	function drawCurve(p) {
		var pc = controlPoints(p);
		 
		// CHART LINE BACKGROUND FILL //

		ctx.beginPath();
		ctx.moveTo(p[0].x + cSlideX, B.y - 10);
		ctx.lineTo(p[0].x + cSlideX, p[0].y);

		// the first & the last curve are quadratic Bezier
		// because I'm using push(), pc[i][1] comes before pc[i][0]
		ctx.quadraticCurveTo(pc[1][1].x + cSlideX, pc[1][1].y, p[1].x + cSlideX, p[1].y);

		if (p.length > 2) {
			// central curves are cubic Bezier
			for (var i = 1; i < p.length - 2; i++)
				ctx.bezierCurveTo(pc[i][0].x + cSlideX, pc[i][0].y, pc[i + 1][1].x + cSlideX, pc[i + 1][1].y, p[i + 1].x + cSlideX, p[i + 1].y);
			
			// the first & the last curve are quadratic Bezier
			var n = p.length - 1;
			ctx.quadraticCurveTo(pc[n - 1][0].x + cSlideX, pc[n - 1][0].y, p[n].x + cSlideX, p[n].y);
		}
			
		ctx.lineTo(p[p.length-1].x + cSlideX, B.y - 10);
		ctx.fillStyle = chartFilling;
		ctx.fill();
		  
		// CHART TOP CENTER LINE //
		  
		ctx.beginPath();
		ctx.lineWidth = 3;
		  
		ctx.lineTo(p[0].x + cSlideX, p[0].y);
		  
		ctx.strokeStyle = cLineColor;
		  
		ctx.quadraticCurveTo(pc[1][1].x + cSlideX, pc[1][1].y, p[1].x + cSlideX, p[1].y);

		if (p.length > 2) {
			for (var i = 1; i < p.length - 2; i++)
				ctx.bezierCurveTo(pc[i][0].x + cSlideX, pc[i][0].y, pc[i + 1][1].x + cSlideX, pc[i + 1][1].y, p[i + 1].x + cSlideX, p[i + 1].y);
				
			var n = p.length - 1;
			ctx.quadraticCurveTo(pc[n - 1][0].x + cSlideX , pc[n - 1][0].y, p[n].x + cSlideX, p[n].y);
			//ctx.lineTo(p[p.length - 1].x + cSlideX, p[p.length - 1].y);
		}
		  
		ctx.stroke();

		// CHART TOP LEFT LINE AND BACKGROUND FILL //
		  
		ctx.beginPath();
		ctx.moveTo(p[0].x + cSlideX, p[0].y);
		ctx.lineTo(chart.style.left, p[0].y);
		ctx.lineTo(chart.style.left, B.y - 10);
		ctx.lineTo(p[0].x + cSlideX, B.y - 10);

		//ctx.stroke();
		ctx.fillStyle = chartFilling;
		ctx.fill();
		  
		ctx.beginPath();
		ctx.moveTo(p[0].x + cSlideX, p[0].y);
		ctx.lineTo(chart.style.left, p[0].y);
		ctx.stroke();
		  
		// CHART TOP RIGHT LINE AND BACKGROUND FILL //
		  
		ctx.beginPath();
		ctx.moveTo(p[p.length -1].x + cSlideX, p[p.length - 1].y);
		ctx.lineTo(chart.style.left + chart.width, p[p.length - 1].y);
		ctx.lineTo(chart.style.left + chart.width, B.y - 10);
		ctx.lineTo(p[p.length -1].x + cSlideX, B.y - 10);
		  
		//ctx.stroke();
		ctx.fillStyle = chartFilling;
		ctx.fill();
		  
		ctx.beginPath();
		ctx.moveTo(chart.style.left + chart.width, p[p.length - 1].y);
		ctx.lineTo(p[p.length - 1].x + cSlideX, p[p.length - 1].y);
		ctx.stroke();
	}

	// CURVATURE //
	function controlPoints(p) {
		// given the points array p calculate the control points
		var pc = [];
		for (var i = 1; i < p.length - 1; i++) {
		var dx = p[i - 1].x - p[i + 1].x; // difference x
		var dy = p[i - 1].y - p[i + 1].y; // difference y
		// the first control point
		var x1 = p[i].x - dx * cCurvature;
		var y1 = p[i].y - dy * cCurvature;
		var o1 = {
			x: x1,
			y: y1
		};

		// the second control point
		var x2 = p[i].x + dx * cCurvature;
		var y2 = p[i].y + dy * cCurvature;
		var o2 = {
			x: x2,
			y: y2
		};

		// building the control points array
		pc[i] = [];
		pc[i].push(o1);
		pc[i].push(o2);
	  }
		return pc;
	}

	/* EVENTS */

	// CHART SLIDING //

	var cSlideCurrentX = 0,
		cSlideInitialX = 0,
		cSlideOffsetX = 0,
		cSlideX = 0,
		cSliding = false,
		cSlidingAnimation = false,
		cSlidingWallOff = cOffsetX / 2,
		cSlidingWallBounceSpeed = cWallBounceSpeed,
		cSlidingWallBounceForce = cWallBounceForce;
		cSlideLeftWall = false,
		cSlideRightWall = false;

	var cMobileClick = false;

	// DESKTOP //
	chart.addEventListener('mousedown', function(e) { cSliding = true; if (cSlidingAnimation == false) { cSlideInitialX = e.clientX - cSlideOffsetX; } });
	chart.addEventListener('mousemove', function(e) { slidingWallsPerform(e); });
	chart.addEventListener('mouseup', function() { cSliding = false; slidingWalls(); });
	chart.addEventListener('mouseout', function() { cSliding = false; slidingWalls(); });
	// MOBILE //
	chart.addEventListener('touchstart', function(e) { e.preventDefault(); cMobileClick = true; cSliding = true; if (cSlidingAnimation == false) { cSlideInitialX = e.touches[0].clientX - cSlideOffsetX; } });
	chart.addEventListener('touchmove', function(e) { e.preventDefault(); slidingWallsPerform(e); });
	chart.addEventListener('touchend', function(e) { e.preventDefault(); cSliding = false; slidingWalls(); });
	chart.addEventListener('touchcancel', function(e) { e.preventDefault(); cSliding = false; slidingWalls(); });
	
	
	function slidingWallsPerform(e) {
		//console.log(`cSlideInitialX: ${cSlideInitialX} | oFlat[0] + cont.x: ${container.position().left + oFlat[0].x}\ncSlideCurrentX: ${cSlideCurrentX}\ncSlideOffsetX: ${cSlideOffsetX}\ncSlideX: ${cSlideX}\noFlat[max]: ${oFlat[oFlat.length - 1].x}`);
		//console.log(`anim: ${cSlidingAnimation}`);
		
		if (cSlidingAnimation)
			return;

		// Left wall
		if (cSlideX > cSlidingWallOff)
			cSlideLeftWall = true

		// Right wall
		if (cSlideX < -Math.abs(cSlidingWallBounceForce) && ((cSlideX - cw) < -Math.abs(oFlat[oFlat.length - 1].x) - (cSlidingWallOff * 3)))
			cSlideRightWall = true;
			
		if (cSliding == true) {
			if (cMobileClick)
				cSlideCurrentX = e.touches[0].clientX - cSlideInitialX;
			else
				cSlideCurrentX = e.clientX - cSlideInitialX;
			
			cSlideOffsetX = cSlideCurrentX
				
			cSlideX = cSlideCurrentX;
		}
	}
	
	
	
	function slidingWalls() {
		if (cSlidingAnimation)
			return;
		
		if (cSlideLeftWall) {
			cSlidingAnimation = true;
			
			var speedDiff = 100;
			
			// Left to right animation
			if (cSlideX > cSlidingWallOff) {
				(function loop() {
					setTimeout(function() {
						if (Math.floor(cSlideX) > 0) {
							var _speedDiff = Math.abs((Math.abs(cSlideX) - 0) / ((Math.abs(cSlideX) + 0) / 2 )) * 100 ;
							
							if (_speedDiff > 15)
								cSlideX -= (Math.abs(cSlideX / speedDiff) * cSlidingWallBounceSpeed);
							else if (_speedDiff > 10)
								cSlideX -= (Math.abs(cSlideX / (speedDiff * 2)) * cSlidingWallBounceSpeed);
							else if (_speedDiff > 8)
								cSlideX -= (Math.abs(cSlideX / (speedDiff * 5)) * cSlidingWallBounceSpeed);
							else if (_speedDiff > 6)
								cSlideX -= (Math.abs(cSlideX / (speedDiff * 8)) * cSlidingWallBounceSpeed);
							else if (_speedDiff > 4)
								cSlideX -= (Math.abs(cSlideX / (speedDiff * 11)) * cSlidingWallBounceSpeed);
							else if (_speedDiff > 2)
								cSlideX -= (Math.abs(cSlideX / (speedDiff * 14)) * cSlidingWallBounceSpeed);
							else
								cSlideX -= (Math.abs(cSlideX / (speedDiff * 17)) * cSlidingWallBounceSpeed);
							
							loop();
						} else {
							cSlidingAnimation = false;
							
							cSlideX = 0;
							cSlideOffsetX = 0;
							cSlideCurrentX = 0;
						}
					}, cSlidingWallBounceSpeed)
				})();
			} else
				cSlidingAnimation = false;

			cSlideLeftWall = false;	
		}

		if (cSlideRightWall) {
			cSlidingAnimation = true;
			
			var _oFlatLast = oFlat[oFlat.length - 1].x;
			var _lnpx = (-Math.abs(_oFlatLast) + cw) - (cSlidingWallOff * 2);
			var _diff = Math.round((cw - _oFlatLast) - (cSlidingWallOff * 2));
			
			var lastNodePosX = Math.floor(_lnpx - ((_oFlatLast < cw) ? _diff : 0));
			var speedDiff = 100;//_oFlatLast < cw ? 50 : 300;
			
			// Left to right animation
			if ((cSlideX - cw) < -Math.abs(_oFlatLast) - (cSlidingWallOff * 2)) {
				(function loop() {
					setTimeout(function() {
						if (cSlideX < lastNodePosX - 1) {
							var _speedDiff = Math.abs((cSlideX - lastNodePosX) / ((cSlideX + lastNodePosX) / 2 )) * 100 ;

							if (_speedDiff > 15)
								cSlideX += (Math.abs(cSlideX / speedDiff) * cSlidingWallBounceSpeed);
							else if (_speedDiff > 10)
								cSlideX += (Math.abs(cSlideX / (speedDiff * 2)) * cSlidingWallBounceSpeed);
							else if (_speedDiff > 8)
								cSlideX += (Math.abs(cSlideX / (speedDiff * 5)) * cSlidingWallBounceSpeed);
							else if (_speedDiff > 6)
								cSlideX += (Math.abs(cSlideX / (speedDiff * 8)) * cSlidingWallBounceSpeed);
							else if (_speedDiff > 4)
								cSlideX += (Math.abs(cSlideX / (speedDiff * 11)) * cSlidingWallBounceSpeed);
							else if (_speedDiff > 2)
								cSlideX += (Math.abs(cSlideX / (speedDiff * 14)) * cSlidingWallBounceSpeed);
							else
								cSlideX += (Math.abs(cSlideX / (speedDiff * 17)) * cSlidingWallBounceSpeed);
							
							loop();
						} else {
							cSlidingAnimation = false;
							
							cSlideX = lastNodePosX;
							cSlideOffsetX = lastNodePosX;
							cSlideCurrentX = lastNodePosX;
						}
					}, cSlidingWallBounceSpeed)
				})();
				
				// Occurs when the chart width is too narrowed and there is low amount of data
				// Used in order to perfectly positioning at the start of the chart the X coord
				if (cSlideX > 0) {
					cSlideX = 0;
					cSlideOffsetX = 0;
					cSlideCurrentX = 0;
				}
			} else
				cSlidingAnimation = false;

			cSlideRightWall = false;
		}
	}

	// MOUSE OVER NODE COMMENT //

	function commentMouseoverClick(cCurvature, e) {
		commentLabel.html("");
		commentLabel.css("display", "none");
		cCurvature.style.cursor = "default";

		var m = oMousePos(cCurvature, e);
		for (var i = 0; i < oDots.length; i++)
			nodeComment(m, i);
	}

	function nodeComment(m, i) {
		var nTitle = cData[i].notes.title;
		var nDesc = cData[i].notes.description;

		if (nTitle != "") {
			ctx.beginPath();
			ctx.arc(oDots[i].x + cSlideX, oDots[i].y, 20, 0, 2 * Math.PI);
			if (ctx.isPointInPath(m.x + cSlideX, m.y)) {
				commentLabel.css("display", "block");
				commentLabel.css("visibility", "visible");
				commentLabel.css("top", (m.y - 130) + "px");
				commentLabel.css("left", (m.x - 35) + cSlideX + "px");
				commentLabel.html(`<strong>${nTitle}<br><br></strong>${nDesc}`);
				chart.style.cursor = "pointer";
			}
		}
	}

	chart.addEventListener('mousemove', function(e){ commentMouseoverClick(this, e); });
	chart.addEventListener('click', function(e){ commentMouseoverClick(this, e); });
	chart.addEventListener('touchstart', function(e) { e.preventDefault(); commentMouseoverClick(this, e); });

	/////////////////////////////////////////////////////

	function arrayMax(array) {
		return Math.max.apply(Math, array);
	};

	function arrayMin(array) {
		return Math.min.apply(Math, array);
	};

	function oMousePos(canvas, evt) {
		var ClientRect = canvas.getBoundingClientRect();
		return {
			x: Math.round((cMobileClick ? evt.touches[0].clientX - ClientRect.left : evt.clientX - ClientRect.left)) - cSlideX,
			y: Math.round((cMobileClick ? evt.touches[0].clientY : evt.clientY) - ClientRect.top)
		}
	}
}, 0);
