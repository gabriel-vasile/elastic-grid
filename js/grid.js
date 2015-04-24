
ElasticGrid = (function() {
    var iconSources     = ["batteryfull", "brightness", "calculator", "check", "computer", "cursor", "dev", "frames", "profile", "tablet"],
        messages        = ["Elastic layout grid.", "No CSS, all Javascript.", "Can be used to display testimonials.", "Or maybe as an image gallery.", "Uses Pixi.js so it works on most devices.", "Adjust number of rows and columns.", "Or let it guess the best settings.", "Hipster ipsum dolor sit amet."],
        icons           = [],
        points          = [],
        geoms           = [],
        texts           = [],
        originalPoints  = [],
        iconsCounter    = 0,
        stage, renderer, 
        horizontalTiles,
        verticalTiles,
        lastTween, 
        windowWidth     = window.innerWidth,
        windowHeight    = window.innerHeight,
        halfTileWidth,
        halfTileHeight,
        displacement;

        return {
            init   : initPIXI,
            animate: animate
        }

        function initPIXI(horizonTiles, vertTiles) {
            horizontalTiles = horizonTiles || 6;
            verticalTiles   = verticalTiles|| 4;
            halfTileWidth = (Math.round(windowWidth / horizontalTiles)) / 2,
            halfTileHeight = (Math.round(windowHeight / verticalTiles)) / 2,
            displacement = {
                x: Math.round(halfTileWidth / 3),
                y: Math.round(halfTileHeight / 3)
            }
            stage = new PIXI.Container();
            stage.interactive = true;
            renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, {
                antialias: true,
                forceFXAA: true,
                resolution: window.devicePixelRatio
            });
            //renderer.view.width = renderer.view.width/2
            //renderer.view.height = renderer.view.height/2
            console.log(renderer.view)
            console.log(window.innerHeight)
            document.body.appendChild(renderer.view);
            window.addEventListener('resize', handleWindowResize)
            createCorners(horizontalTiles, verticalTiles)
            createTiles();
        }

        function createCorners(cornersHorizontal, cornersVertical) {
            var i, j, ii = 0,
                jj = 0;
            for (i = 1; i < windowHeight + 3; i += windowHeight / cornersVertical) {
                points[ii] = [];
                for (j = 1; j < windowWidth + 3; j += windowWidth / cornersHorizontal) {
                    points[ii][jj] = new PIXI.Point(Math.round(j), Math.round(i));
                    jj++;
                }
                jj = 0;
                ii++;
            }
        }

        function createTiles() {
            for (var i = 0; i < points.length - 1; i++) {
                geoms[i] = [];
                icons[i] = [];
                originalPoints[i] = [];
                texts[i] = [];
                for (var j = 0; j < points[0].length - 1; j++) {
                    geoms[i][j] = createGeo(i, j);
                    icons[i][j] = createIcon(i, j);
                    texts[i][j] = createText(i, j);
                    fixPositions(i, j);
                    geoms[i][j].mouseover = geoms[i][j].touchstart = handleFocus;
                    geoms[i][j].mouseout = geoms[i][j].touchend = geoms[i][j].touchendoutside = handleLostFocus


                    geoms[i][j].addChild(icons[i][j]);
                    geoms[i][j].addChild(texts[i][j]);
                    stage.addChild(geoms[i][j])
                }
            }
        }
        function redrawTiles(i, j) {
            var graphics = [geoms[i][j], geoms[i - 1] && geoms[i - 1][j - 1] ? geoms[i - 1][j - 1] : undefined, geoms[i - 1] && geoms[i - 1][j] ? geoms[i - 1][j] : undefined, geoms[i - 1] && geoms[i - 1][j + 1] ? geoms[i - 1][j + 1] : undefined, geoms[i] && geoms[i][j + 1] ? geoms[i][j + 1] : undefined, geoms[i + 1] && geoms[i + 1][j + 1] ? geoms[i + 1][j + 1] : undefined, geoms[i + 1] && geoms[i + 1][j] ? geoms[i + 1][j] : undefined, geoms[i + 1] && geoms[i + 1][j - 1] ? geoms[i + 1][j - 1] : undefined, geoms[i] && geoms[i][j - 1] ? geoms[i][j - 1] : undefined, ],
                k;
            for (k = 0; k < 9; k++) {
                if (graphics[k] !== undefined) graphics[k].updateVisual();
            }
        }

        function extendGraphic(i, j, x, y) {
            var points = geoms[i][j].currentPath.shape.points;
            var pointsEnd = []
            if (i === 0) {
                if (j === 0) {
                    pointsEnd[0] = originalPoints[i][j][0]
                    pointsEnd[1] = originalPoints[i][j][1]
                    pointsEnd[2] = originalPoints[i][j][2]
                    pointsEnd[3] = originalPoints[i][j][3] + 2 * y
                    pointsEnd[4] = originalPoints[i][j][4] + 2 * x
                    pointsEnd[5] = originalPoints[i][j][5] + 2 * y
                    pointsEnd[6] = originalPoints[i][j][6] + 2 * x
                    pointsEnd[7] = originalPoints[i][j][7]
                } else if (j === geoms[0].length - 1) {
                    pointsEnd[0] = originalPoints[i][j][0] - 2 * x
                    pointsEnd[1] = originalPoints[i][j][1]
                    pointsEnd[2] = originalPoints[i][j][2] - 2 * x
                    pointsEnd[3] = originalPoints[i][j][3] + 2 * y
                    pointsEnd[4] = originalPoints[i][j][4]
                    pointsEnd[5] = originalPoints[i][j][5] + 2 * y
                    pointsEnd[6] = originalPoints[i][j][6]
                    pointsEnd[7] = originalPoints[i][j][7]
                } else {
                    pointsEnd[0] = originalPoints[i][j][0] - x
                    pointsEnd[1] = originalPoints[i][j][1]
                    pointsEnd[2] = originalPoints[i][j][2] - x
                    pointsEnd[3] = originalPoints[i][j][3] + 2 * y
                    pointsEnd[4] = originalPoints[i][j][4] + x
                    pointsEnd[5] = originalPoints[i][j][5] + 2 * y
                    pointsEnd[6] = originalPoints[i][j][6] + x
                    pointsEnd[7] = originalPoints[i][j][7]
                }
            } else if (i === geoms.length - 1) {
                if (j === 0) {
                    pointsEnd[0] = originalPoints[i][j][0]
                    pointsEnd[1] = originalPoints[i][j][1] - 2 * y
                    pointsEnd[2] = originalPoints[i][j][2]
                    pointsEnd[3] = originalPoints[i][j][3]
                    pointsEnd[4] = originalPoints[i][j][4] + 2 * x
                    pointsEnd[5] = originalPoints[i][j][5]
                    pointsEnd[6] = originalPoints[i][j][6] + 2 * x
                    pointsEnd[7] = originalPoints[i][j][7] - 2 * y
                } else if (j === geoms[0].length - 1) {
                    pointsEnd[0] = originalPoints[i][j][0] - 2 * x
                    pointsEnd[1] = originalPoints[i][j][1] - 2 * y
                    pointsEnd[2] = originalPoints[i][j][2] - 2 * x
                    pointsEnd[3] = originalPoints[i][j][3]
                    pointsEnd[4] = originalPoints[i][j][4]
                    pointsEnd[5] = originalPoints[i][j][5]
                    pointsEnd[6] = originalPoints[i][j][6]
                    pointsEnd[7] = originalPoints[i][j][7] - 2 * y
                } else {
                    pointsEnd[0] = originalPoints[i][j][0] - x
                    pointsEnd[1] = originalPoints[i][j][1] - 2 * y
                    pointsEnd[2] = originalPoints[i][j][2] - x
                    pointsEnd[3] = originalPoints[i][j][3]
                    pointsEnd[4] = originalPoints[i][j][4] + x
                    pointsEnd[5] = originalPoints[i][j][5]
                    pointsEnd[6] = originalPoints[i][j][6] + x
                    pointsEnd[7] = originalPoints[i][j][7] - 2 * y
                }
            } else if (j === 0) {
                pointsEnd[0] = originalPoints[i][j][0]
                pointsEnd[1] = originalPoints[i][j][1] - y
                pointsEnd[2] = originalPoints[i][j][2]
                pointsEnd[3] = originalPoints[i][j][3] + y
                pointsEnd[4] = originalPoints[i][j][4] + 2 * x
                pointsEnd[5] = originalPoints[i][j][5] + y
                pointsEnd[6] = originalPoints[i][j][6] + 2 * x
                pointsEnd[7] = originalPoints[i][j][7] - y
            } else if (j === geoms[0].length - 1) {
                pointsEnd[0] = originalPoints[i][j][0] - 2 * x
                pointsEnd[1] = originalPoints[i][j][1] - y
                pointsEnd[2] = originalPoints[i][j][2] - 2 * x
                pointsEnd[3] = originalPoints[i][j][3] + y
                pointsEnd[4] = originalPoints[i][j][4]
                pointsEnd[5] = originalPoints[i][j][5] + y
                pointsEnd[6] = originalPoints[i][j][6]
                pointsEnd[7] = originalPoints[i][j][7] - y
            } else {
                pointsEnd[0] = originalPoints[i][j][0] - x
                pointsEnd[1] = originalPoints[i][j][1] - y
                pointsEnd[2] = originalPoints[i][j][2] - x
                pointsEnd[3] = originalPoints[i][j][3] + y
                pointsEnd[4] = originalPoints[i][j][4] + x
                pointsEnd[5] = originalPoints[i][j][5] + y
                pointsEnd[6] = originalPoints[i][j][6] + x
                pointsEnd[7] = originalPoints[i][j][7] - y
            }
            pointsEnd.onUpdate = function() {
                boundNeighbours(i, j);
                redrawTiles(i, j);
            }
            pointsEnd.ease = Back.easeInOut;
            TweenLite.to(points, .2, pointsEnd)
        }

        function boundNeighbours(i, j) {
            boundNW(i, j);
            boundN(i, j);
            boundNE(i, j);
            boundE(i, j);
            boundSE(i, j);
            boundS(i, j);
            boundSW(i, j);
            boundW(i, j);
        }

        function boundNW(i, j) {
            if ((i === 0) || (j === 0)) return;
            geoms[i - 1][j - 1].currentPath.shape.points[4] = geoms[i][j].currentPath.shape.points[0];
            geoms[i - 1][j - 1].currentPath.shape.points[5] = geoms[i][j].currentPath.shape.points[1];
        }

        function boundNE(i, j) {
            if ((i === 0) || (j === geoms[0].length - 1)) return;
            geoms[i - 1][j + 1].currentPath.shape.points[2] = geoms[i][j].currentPath.shape.points[6];
            geoms[i - 1][j + 1].currentPath.shape.points[3] = geoms[i][j].currentPath.shape.points[7];
        }

        function boundE(i, j) {
            if (j === geoms[0].length - 1) return;
            geoms[i][j + 1].currentPath.shape.points[0] = geoms[i][j].currentPath.shape.points[6];
            geoms[i][j + 1].currentPath.shape.points[1] = geoms[i][j].currentPath.shape.points[7];
            geoms[i][j + 1].currentPath.shape.points[2] = geoms[i][j].currentPath.shape.points[4];
            geoms[i][j + 1].currentPath.shape.points[3] = geoms[i][j].currentPath.shape.points[5];
        }

        function boundSE(i, j) {
            if ((i === geoms.length - 1) || (j === geoms[0].length - 1)) return;
            geoms[i + 1][j + 1].currentPath.shape.points[0] = geoms[i][j].currentPath.shape.points[4];
            geoms[i + 1][j + 1].currentPath.shape.points[1] = geoms[i][j].currentPath.shape.points[5];
        }

        function boundN(i, j) {
            if (i === 0) return;
            geoms[i - 1][j].currentPath.shape.points[4] = geoms[i][j].currentPath.shape.points[6];
            geoms[i - 1][j].currentPath.shape.points[5] = geoms[i][j].currentPath.shape.points[7];
            geoms[i - 1][j].currentPath.shape.points[2] = geoms[i][j].currentPath.shape.points[0];
            geoms[i - 1][j].currentPath.shape.points[3] = geoms[i][j].currentPath.shape.points[1];
        }

        function boundSW(i, j) {
            if ((j === 0) || (i === geoms.length - 1)) return;
            geoms[i + 1][j - 1].currentPath.shape.points[6] = geoms[i][j].currentPath.shape.points[2];
            geoms[i + 1][j - 1].currentPath.shape.points[7] = geoms[i][j].currentPath.shape.points[3];
        }

        function boundS(i, j) {
            if (i === geoms.length - 1) return;
            geoms[i + 1][j].currentPath.shape.points[0] = geoms[i][j].currentPath.shape.points[2];
            geoms[i + 1][j].currentPath.shape.points[1] = geoms[i][j].currentPath.shape.points[3];
            geoms[i + 1][j].currentPath.shape.points[6] = geoms[i][j].currentPath.shape.points[4];
            geoms[i + 1][j].currentPath.shape.points[7] = geoms[i][j].currentPath.shape.points[5];
        }

        function boundW(i, j) {
            if (j === 0) return;
            geoms[i][j - 1].currentPath.shape.points[6] = geoms[i][j].currentPath.shape.points[0];
            geoms[i][j - 1].currentPath.shape.points[7] = geoms[i][j].currentPath.shape.points[1];
            geoms[i][j - 1].currentPath.shape.points[4] = geoms[i][j].currentPath.shape.points[2];
            geoms[i][j - 1].currentPath.shape.points[5] = geoms[i][j].currentPath.shape.points[3];
        }

        function createGeo(i, j) {
            var geo = new PIXI.Graphics();
            var k;
            geo.moveTo(points[i][j].x, points[i][j].y);
            geo.beginFill(0xdddddd);
            geo.lineStyle(3, 0x333333, 1);
            geo.lineTo(points[i + 1][j])
            geo.lineTo(points[i + 1][j + 1])
            geo.lineTo(points[i][j + 1])
            geo.endFill()
            geo.interactive = true;
            originalPoints[i][j] = []
            for (k = 0; k < 8; k++) originalPoints[i][j][k] = geo.currentPath.shape.points[k]
            return geo;
        }

        function createIcon(i, j) {
            var iconPath = window.devicePixelRation > 1 ?
                            './img/' + iconSources[iconsCounter % 10] + '.png' :
                            './img/' + iconSources[iconsCounter % 10] + '@x2.png'
            var icon = new PIXI.Sprite(new PIXI.Texture.fromImage('./img/' + iconSources[iconsCounter % 10] + '.png'))
            icon.anchor.x = icon.anchor.y = .5;
            icon.scale.x = icon.scale.y = .6;
            icon.alpha = .2;
            return icon;
        }

        function createText(i, j) {
            var textOptions = {
                font: window.innerWidth>1500? '25px Roboto' : '15px Roboto',
                fill: '#222',
                wordWrap: true,
                wordWrapWidth: 2 * halfTileWidth,
                align: 'center'
            }
            var text = new PIXI.Text(messages[iconsCounter++ % 8], textOptions)
            text.anchor.x = text.anchor.y = .5;
            text.scale.x = text.scale.y = .5;
            text.alpha = 0;
            return text
        }

        function fixPositions(i, j) {
            var yDisp = -displacement.y;
            var xDisp = 0;
            icons[i][j].x = points[i][j].x + halfTileWidth;
            icons[i][j].y = points[i][j].y + halfTileHeight;
            if (i === 0) {
                yDisp = 0;
            } else if (i === geoms.length - 1) {
                yDisp = -displacement.y;
            }
            if (j === 0) {
                xDisp = displacement.x;
            } else if (j === geoms[0].length - 1) {
                xDisp = -displacement.x;
            }
            texts[i][j].x = points[i][j].x + halfTileWidth;
            texts[i][j].y = points[i][j].y + 2 * halfTileHeight + yDisp;
        }

        function handleFocus(data) {
            var i, j;
            for (i = 0; i < geoms.length; i++) {
                for (j = 0; j < geoms[0].length; j++) {
                    if (data.target === geoms[i][j]) {
                        tileFocused(i, j);
                    }
                }
            }
        }

        function tileFocused(tileRow, tileCol) {
            stage.addChild(geoms[tileRow][tileCol])
            geoms[tileRow][tileCol].currentPath.fillColor = 12312312;
            extendGraphic(tileRow, tileCol, displacement.x, displacement.y);
            var iconNewPos = {
                x: points[tileRow][tileCol].x + halfTileWidth,
                y: points[tileRow][tileCol].y + halfTileHeight - 2 * displacement.y,
                iScale: window.innerWidth> 1500? 1 : .7,
                alpha: 1
            }
            iconNewPos.onUpdate = function(){
                icons[tileRow][tileCol].scale.x = 
                icons[tileRow][tileCol].scale.y = iconNewPos.iScale;
            }
            var textNewPos = {
                x: points[tileRow][tileCol].x + halfTileWidth,
                y: points[tileRow][tileCol].y + halfTileHeight + displacement.y,
                tScale: 1,
                alpha: 1,
                delay: 0.15
            }
            textNewPos.onUpdate = function() {
                texts[tileRow][tileCol].scale.x = 
                texts[tileRow][tileCol].scale.y = textNewPos.tScale;
            }
            if (tileCol === 0) {
                iconNewPos.x = points[tileRow][tileCol].x + halfTileWidth + displacement.x
                textNewPos.x = points[tileRow][tileCol].x + halfTileWidth + displacement.x
            } else if (tileCol === geoms[0].length - 1) {
                iconNewPos.x = points[tileRow][tileCol].x + halfTileWidth - displacement.x
                textNewPos.x = points[tileRow][tileCol].x + halfTileWidth - displacement.x
            }
            if (tileRow === 0) {
                iconNewPos.y = points[tileRow][tileCol].y + halfTileHeight - displacement.y
                textNewPos.y = points[tileRow][tileCol].y + halfTileHeight + 2 * displacement.y
            } else if (tileRow === geoms.length - 1) {
                iconNewPos.y = points[tileRow][tileCol].y + halfTileHeight - 3 * displacement.y
                textNewPos.y = points[tileRow][tileCol].y + halfTileHeight + displacement.y
            }
            TweenLite.to(icons[tileRow][tileCol], 0.2, iconNewPos)
            lastTween = TweenLite.to(texts[tileRow][tileCol], 0.2, textNewPos)
        }

        function handleLostFocus(data) {
            var i, j;
            for (i = 0; i < geoms.length; i++) {
                for (j = 0; j < geoms[0].length; j++) {
                    if (data.target === geoms[i][j]) {
                        tileUnfocused(i, j)
                    }
                }
            }
        }
        function tileUnfocused(tileRow, tileCol) {
            geoms[tileRow][tileCol].currentPath.fillColor = 14540253;
            extendGraphic(tileRow, tileCol, 0, 0);
            var yDisp = -displacement.y;
            var xDisp = 0;
            if (tileRow === 0) {
                yDisp = 0;
            } else if (tileRow === geoms.length - 1) {
                yDisp = -displacement.y;
            }
            if (tileCol === 0) {
                xDisp = displacement.x;
            } else if (tileCol === geoms[0].length - 1) {
                xDisp = -displacement.x;
            }
            var iconNewPos = {
                x: points[tileRow][tileCol].x + halfTileWidth,
                y: points[tileRow][tileCol].y + halfTileHeight,
                alpha: .2,
                iScale: .6
            }
            iconNewPos.onUpdate = function(){
                icons[tileRow][tileCol].scale.x = 
                icons[tileRow][tileCol].scale.y = iconNewPos.iScale; 
            }
            var textNewPos = {
                x: points[tileRow][tileCol].x + halfTileWidth + xDisp,
                y: points[tileRow][tileCol].y + 2 * halfTileHeight + yDisp,
                alpha: 0
            }
            TweenLite.to(icons[tileRow][tileCol], 0.2, iconNewPos)
            lastTween.reverse();
        }

        function animate() {
            requestAnimationFrame(animate);
            renderer.render(stage);
        }

        function handleWindowResize() {
            setVars();
            renderer.resize(windowWidth, windowHeight);
            console.log('resize')
            createCorners(horizontalTiles, verticalTiles)
            for (var i = 0; i < points.length - 1; i++) {
                geoms[i] = [];
                originalPoints[i] = [];
                for (var j = 0; j < points[0].length - 1; j++) {
                    geoms[i][j] = createGeo(i, j);
                    fixPositions(i, j);
                    geoms[i][j].mouseover = geoms[i][j].touchstart = handleFocus;
                    geoms[i][j].mouseout = geoms[i][j].touchend = handleLostFocus
                    geoms[i][j].addChild(icons[i][j]);
                    geoms[i][j].addChild(texts[i][j]);
                    stage.addChild(geoms[i][j])
                }
            }
        }

        function setVars() {
            windowWidth = window.innerWidth, windowHeight = window.innerHeight;
            halfTileWidth = (Math.round(windowWidth / horizontalTiles)) / 2;
            halfTileHeight = (Math.round(windowHeight / verticalTiles)) / 2;
            displacement = {
                x: Math.round(halfTileWidth / 3),
                y: Math.round(halfTileHeight / 3)
            }
        }
    

});
