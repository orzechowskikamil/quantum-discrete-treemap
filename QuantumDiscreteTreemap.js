/**
 * Quantum/Discrete treemap in Javascript
 *
 * @author Kamil Orzechowski orzechowski.kam@gmail.com
 *
 * I prefer name Discrete treemap because by this keyword I tried to find
 * this algorithm for two weeks, until I accidentally found it named
 * Quantum Treemap.
 *
 * It's javascript port of Quantum Treemap algorithm, originally written in Java by
 * professor Benjamin B. Benderson in 2001 year. Original algorithm's
 * implementation was 1100 lines long, this version is shortened by removal
 * of debug and findAlternativeLayouts methods.
 *
 * Seems that algorithm was completely forgotten: in 2019 year, original Java
 * implementation from 2001 is only one existing in the internet.
 *
 * Quantum Treemap is algorithm which calculate treemap layout, considering
 * fact that values are not represented by rectangles which sides can be
 * real values and area of this rectangle is equal to value of the data entry,
 * but rather by rectangles which amount is integer value, and side of the
 * rectangle can be no smaller than one rectangle's side. It's ideal
 * to display for example directories which contains photos, while photo
 * miniature has always same size, or, for example, visualize state of
 * many items of particular type
 *
 * I added horizontal and vertical padding to the algorithm, by using this
 * separation between rectangles, or preserving space for labels is possible.
 *
 * Because original code was published on Mozilla Public License, I also
 * have to publish it on Mozilla Public License, and additionally, I have
 * to include following header from original file:
 *
 * <p>
 * "The contents of this directory tree are subject to the Mozilla Public
 * License Version 1.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License
 * at http://www.mozilla.org/MPL/.
 * <p>
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * <p>
 * The Original Code is Quantum Treemap v1.0
 * <p>
 * The Initial Developer of the Original Code is Benjamin B. Bederson.
 * All of the code is Copyright (C) University of Maryland. All Rights Reserved.
 * <p>
 */




/**
 * Such class exist in Java, here it needs to be polyfilled
 */
class Rectangle {
    x;
    y;
    width;
    height;

    constructor(arg1, arg2, arg3, arg4) {
        if (typeof arg1 === 'undefined') {
            // new Rectangle()
            this.setRect(0, 0, 0, 0);
        } else if (arg1 instanceof Rectangle) {
            // new Rectangle(otherRectangle);
            var rectangleToClone = arg1;
            this.setRect(rectangleToClone.x, rectangleToClone.y, rectangleToClone.width, rectangleToClone.height);
        } else {
            // new Rectangle(x,y,width,height);
            this.setRect(arg1, arg2, arg3, arg4);
        }
    }

    setRect(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}

/**
 * Polyfill for another java method
 */
System = {};
System.arraycopy = (source, sourceStartIndex, destination, destinationStartIndex, length) => {
    for (var i = 0; i < length; i++) {
        destination[i + destinationStartIndex] = source[i + sourceStartIndex];
    }
}

/**
 * Another polyfill for java class. Dimension is just width x height
 */
class Dimension {
    width;
    height;

    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
}

class QuantumTreemap {

    EXPECTED_WASTE_FACTOR = 1.15;


    origSizes;
    origBox;
    origiar;
    numQuadLayouts;
    numSnake3Layouts;
    numSnake4Layouts;
    numSnake5Layouts;
    resultRects = null;
    horizontalPadding;
    verticalPadding;


    /**
     * @param {Number[]} sizes Array of values to show on treemap
     * @param {Number} iar ideal aspect ratio
     * @param {Rectangle} box to fit layout
     * @param {Number} horizontalPadding in units - this amount of units will be added to
     *                                   width of each rectangle
     * @param {Number} verticalPadding in units - this amount of units will be added to
     *                                   height of each rectangle
     * @constructor
     */
    constructor(sizes, iar, box,horizontalPadding=0,verticalPadding=0) {
        this.origSizes = sizes;
        this.origBox = box;
        this.origiar = iar;
        this.horizontalPadding=horizontalPadding;
        this.verticalPadding=verticalPadding;
    }


    /**
     *
     * @param {Rectangle} rect
     * @returns {number}
     */
    computeAspectRatio(rect) {
        return rect.width / rect.height;
    }


    /**
     *
     * @param {Number[]} sizes Array of values to show on treemap
     * @returns {number}
     */
    computeSize(sizes) {
        var size = 0;
        if (sizes != null) {
            for (var i = 0; i < sizes.length; i++) {
                size += sizes[i];
            }
        }

        return size;
    }


    /**
     * Compute the total size of the objects between the specified indices, inclusive.
     * @param {Number[]} sizes Array of values to show on treemap
     * @param {Number} i1 first indice
     * @param {Number} i2 second indice
     * @returns {number}
     */
    computeSize3(sizes, i1, i2) {
        var size = 0;
        for (var i = i1; i <= i2; i++) {
            size += sizes[i];
        }

        return size;
    }


    /**
     * @returns {Rectangle[]}
     */
    quantumLayout() {
        this.numQuadLayouts = 0;
        this.numSnake3Layouts = 0;
        this.numSnake4Layouts = 0;
        this.numSnake5Layouts = 0;
        var area = this.computeSize(this.origSizes);
        area *= this.EXPECTED_WASTE_FACTOR;   // Add room for expected waste factor
        var ar = this.computeAspectRatio(this.origBox) / this.origiar;
        var h = Math.ceil(Math.sqrt(area / ar));
        var w = Math.ceil(area / h);
        var box = new Rectangle(this.origBox.x, this.origBox.y, w, h);

        var boxAR = this.computeAspectRatio(box);
        var growWide = ((boxAR >= 1) ? true : false);
        this.resultRects = this._quantumLayout(this.origSizes, box, growWide);

        return this.resultRects;
    }


    /**
     *
     * @param {Number[]} sizes Array of values
     * @param {Rectangle} box Box to fit
     * @param {Boolean} growWide ??
     * @returns {Rectangle[]} layout composed from rectangles
     */
    _quantumLayout(sizes, box, growWide) {
        var i;
        var l1 = null;
        var l2 = null;
        var l3 = null;
        var l1Size = 0;
        var l2Size = 0;
        var l3Size = 0;
        var r1 = null;
        var r2 = null;
        var r3 = null;
        var rp = null;
        var r1AR, r2AR, r3AR;
        var pivotIndex;
        var pivotSize;
        var pivotAR;
        var boxes = null;
        var boxAR;
        var box2;        // Layout box for P, R2 and R3
        var w, h;
        var b2Size;
        var ratio;
        var dim1 = null;
        var dim2 = null;
        var dim3 = null;
        var l1finalbox = null;
        var l2finalbox = null;
        var l1boxes = null;
        var l2boxes = null;
        var l3boxes = null;
        var newGrowWide;


        pivotIndex = this.computePivotIndex(sizes);
        pivotSize = sizes[pivotIndex];
        boxAR = this.computeAspectRatio(box);


        // Stopping conditions
        if (sizes.length === 1) {
            boxes = [];
            boxes[0] = box;

            return boxes;
        }

        if (sizes.length === 2) {
            boxes = [];
            ratio = sizes[0] / (sizes[0] + sizes[1]);
            if (growWide) {
                dim1 = this.computeTableLayout(sizes[0], boxAR * ratio);
                dim2 = this.computeTableLayout(sizes[1], boxAR * (1 - ratio));
                h = Math.max(dim1.height, dim2.height);
                dim2 = this.computeTableLayoutGivenHeight(sizes[1], h);
                // h needs to be recomputed due to padding
                h = Math.max(dim1.height, dim2.height);
                boxes[0] = new Rectangle(box.x, box.y, dim1.width, h);
                boxes[1] = new Rectangle(box.x + dim1.width, box.y, dim2.width, dim2.height);
            } else {
                dim1 = this.computeTableLayout(sizes[0], boxAR / ratio);
                dim2 = this.computeTableLayout(sizes[1], boxAR / (1 - ratio));
                w = Math.max(dim1.width, dim2.width);
                dim2 = this.computeTableLayoutGivenWidth(sizes[1], w);
                // w needs to be recomputed due to padding
                w = Math.max(dim1.width, dim2.width);
                boxes[0] = new Rectangle(box.x, box.y, w, dim1.height);
                boxes[1] = new Rectangle(box.x, box.y + dim1.height, dim2.width, dim2.height);
            }

            return boxes;
        }

        // First, compute R1
        if (pivotIndex > 0) {
            l1 = [];
            System.arraycopy(sizes, 0, l1, 0, pivotIndex);
            l1Size = this.computeSize(l1);
            b2Size = this.computeSize3(sizes, pivotIndex, sizes.length - 1);
            if (growWide) {
                dim1 = this.computeTableLayoutGivenHeight(l1Size, box.height);
                dim2 = this.computeTableLayoutGivenHeight(b2Size, box.height);
                r1 = new Rectangle(box.x, box.y, dim1.width, dim1.height);
                box2 = new Rectangle(box.x + dim1.width, box.y, dim2.width, dim2.height);
            } else {
                dim1 = this.computeTableLayoutGivenWidth(l1Size, box.width);
                dim2 = this.computeTableLayoutGivenWidth(b2Size, box.width);
                r1 = new Rectangle(box.x, box.y, dim1.width, dim1.height);
                box2 = new Rectangle(box.x, box.y + dim1.height, dim2.width, dim2.height);
            }
        } else {
            box2 = new Rectangle(box.x, box.y, box.width, box.height);
        }

        // Recurse on R1 to compute better box2
        if (l1 != null) {
            if (l1.length > 1) {
                r1AR = this.computeAspectRatio(r1);
                if (r1AR == 1) {
                    newGrowWide = growWide;
                } else {
                    newGrowWide = ((r1AR >= 1) ? true : false);
                }
                l1boxes = this._quantumLayout(l1, r1, newGrowWide);
            } else {
                l1boxes =[];
                l1boxes[0] = r1;
            }
            l1finalbox = this.computeUnion(l1boxes);
            if (growWide) {
                box2.height = r1.height; // l1finalbox.height;
            } else {
                box2.width = r1.width; // l1finalbox.width;
            }
        }

        // First, split up l2 and l3, for best aspect ratio of pivot
        var first = true;
        var bestAR = 0;
        var w1, h1;
        var bestdim1 = null;
        var bestl2Size = 0;
        var bestIndex = 0;

        for (i = pivotIndex + 1; i < sizes.length; i++) {
            l2Size = this.computeSize3(sizes, pivotIndex + 1, i);
            ratio = pivotSize / (pivotSize + l2Size);
            if (growWide) {
                h1 = Math.ceil(ratio * box2.height);
                dim1 = this.computeTableLayoutGivenHeight(pivotSize, h1);
            } else {
                w1 = Math.ceil(ratio * box2.width);
                dim1 = this.computeTableLayoutGivenWidth(pivotSize, w1);
            }
            pivotAR = Math.max(( dim1.width / dim1.height),
                ( dim1.height / dim1.width));
            if (first || (pivotAR < bestAR)) {
                first = false;
                bestAR = pivotAR;
                bestdim1 = dim1;
                bestl2Size = l2Size;
                bestIndex = i;
            }
        }
        if (bestIndex > 0) {
            l2 = new Array(bestIndex - pivotIndex);
            System.arraycopy(sizes, pivotIndex + 1, l2, 0, l2.length);
            if ((sizes.length - 1 - bestIndex) > 0) {
                l3 = new Array(sizes.length - 1 - bestIndex);
                System.arraycopy(sizes, bestIndex + 1, l3, 0, l3.length);
            }
        }
        if (l2 !== null) {
            if (growWide) {
                dim2 = this.computeTableLayoutGivenHeight(bestl2Size, box2.height - bestdim1.height);
                rp = new Rectangle(box2.x, box2.y, bestdim1.width, bestdim1.height);
                r2 = new Rectangle(box2.x, box2.y + dim1.height, dim2.width, dim2.height);
                if (l3 !== null) {
                    l3Size = this.computeSize3(sizes, bestIndex + 1, sizes.length - 1);
                    dim3 = this.computeTableLayoutGivenHeight(l3Size, box2.height);
                    r3 = new Rectangle(box2.x + dim2.width, box2.y, dim3.width, dim3.height);
                }
            } else {
                dim2 = this.computeTableLayoutGivenWidth(bestl2Size, box2.width - bestdim1.width);
                rp = new Rectangle(box2.x, box2.y, bestdim1.width, bestdim1.height);
                r2 = new Rectangle(box2.x + dim1.width, box2.y, dim2.width, dim2.height);
                if (l3 !== null) {
                    l3Size = this.computeSize3(sizes, bestIndex + 1, sizes.length - 1);
                    dim3 = this.computeTableLayoutGivenWidth(l3Size, box2.width);
                    r3 = new Rectangle(box2.x, box2.y + dim2.height, dim3.width, dim3.height);
                }
            }
        } else {
            if (growWide) {
                dim1 = this.computeTableLayoutGivenHeight(pivotSize, r1.height); // l1finalbox.height);
            } else {
                dim1 = this.computeTableLayoutGivenWidth(pivotSize, r1.width); // l1finalbox.width);
            }
            rp = new Rectangle(box2.x, box2.y, dim1.width, dim1.height);
        }

        // Finally, recurse on sublists in R2 and R3
        if (l2 !== null) {
            if (l2.length > 1) {
                r2AR = this.computeAspectRatio(r2);
                if (r2AR === 1) {
                    newGrowWide = growWide;
                } else {
                    newGrowWide = ((r2AR >= 1));
                }
                l2boxes = this._quantumLayout(l2, r2, newGrowWide);
            } else {
                l2boxes = [];
                l2boxes[0] = r2;
            }
        }
        if (l3 !== null) {
            if (l3.length > 1) {
                r3AR = this.computeAspectRatio(r3);
                if (r3AR === 1) {
                    newGrowWide = growWide;
                } else {
                    newGrowWide = ((r3AR >= 1));
                }
                l3boxes = this._quantumLayout(l3, r3, newGrowWide);
            } else if (l3.length === 1) {
                l3boxes = [];
                l3boxes[0] = r3;
            }
        }

        // Shift and expand/contract the new layouts
        // depending on the the other sub-layouts
        if (growWide) {
            if (l1 !== null) {
                rp.x = l1finalbox.x + l1finalbox.width;
                rp.y = l1finalbox.y;
            }
            if (l2 !== null) {
                this.translateBoxesTo(l2boxes, rp.x, (rp.y + rp.height));
                this.evenBoxWidth2(rp, l2boxes);
                if (l3 != null) {
                    l2finalbox = this.computeUnion(l2boxes);
                    this.translateBoxesTo(l3boxes, (l2finalbox.x + l2finalbox.width), rp.y);
                }
                this.evenBoxHeight3(l1boxes, l2boxes, l3boxes);
            } else {
                this.evenBoxHeight2(rp, l1boxes);
            }
        } else {
            if (l1 != null) {
                rp.x = l1finalbox.x;
                rp.y = l1finalbox.y + l1finalbox.height;
            }
            if (l2 != null) {
                this.translateBoxesTo(l2boxes, (rp.x + rp.width), rp.y);
                this.evenBoxHeight2(rp, l2boxes);
                if (l3 != null) {
                    l2finalbox = this.computeUnion(l2boxes);
                    this.translateBoxesTo(l3boxes, rp.x, (l2finalbox.y + l2finalbox.height));
                }
                this.evenBoxWidth3(l1boxes, l2boxes, l3boxes);
            } else {
                this.evenBoxWidth2(rp, l1boxes);
            }
        }

        boxes = [];
        i = 0;
        if (l1 !== null) {
            System.arraycopy(l1boxes, 0, boxes, 0, l1boxes.length);
            i += l1boxes.length;
        }
        boxes[i] = rp;
        i++;
        if (l2 !== null) {
            System.arraycopy(l2boxes, 0, boxes, i, l2boxes.length);
            i += l2boxes.length;
        }
        if (l3 !== null) {
            System.arraycopy(l3boxes, 0, boxes, i, l3boxes.length);
        }

        return boxes;
    }


    /**
     *
     * @param {Number[]}
     * @returns Number
     */
    computePivotIndex(sizes) {
        var index = 0;
        index =Math.floor((sizes.length - 1) / 2);

        return index;
    }


    /**
     * @param {Rectangle[]} boxes
     * @returns {Rectangle}
     */
    computeUnion(boxes) {
        var x1, x2, y1, y2;
        if (boxes === null) {
            debugger
        }
        var box = new Rectangle(boxes[0]);

        for (var i = 1; i < boxes.length; i++) {
            x1 = Math.min(box.x, boxes[i].x);
            x2 = Math.max(box.x + box.width, boxes[i].x + boxes[i].width);
            y1 = Math.min(box.y, boxes[i].y);
            y2 = Math.max(box.y + box.height, boxes[i].y + boxes[i].height);

            box.setRect(x1, y1, x2 - x1, y2 - y1);
        }

        return box;
    }

    /**
     * Moves boxes by x,y
     * @param {Rectangle[]} rectangles to move
     * @param {Number} x x coord
     * @param {Number} y y coord
     */
    translateBoxesTo(boxes, x, y) {
        var box = this.computeUnion(boxes);
        var dx = x - box.x;
        var dy = y - box.y;

        for (var i = 0; i < boxes.length; i++) {
            boxes[i].x += dx;
            boxes[i].y += dy;
        }
    }

    /**
     *
     * @param {Rectangle} b1
     * @param {Rectangle[]} b2
     */
    evenBoxWidth2(b1 = null, b2 = null) {

        if ((b1 === null) || (b2 === null)) {
            return;
        }

        var b1boxes = [];
        b1boxes[0] = b1;
        this.evenBoxWidth3(b1boxes, b2, null);
    }

    /**
     * Probably set width to be equal on 3 boxes
     * @param {Rectangle[]} b1
     * @param {Rectangle[]} b2
     * @param {Rectangle[]} b3
     */
    evenBoxWidth3(b1, b2, b3) {
        var dx = 0;
        var right;
        var newRight;

        var b1Bounds, b2Bounds, b3Bounds;

        if (b1 != null) {
            b1Bounds = this.computeUnion(b1);
        } else {
            b1Bounds = new Rectangle();
        }
        if (b2 != null) {
            b2Bounds = this.computeUnion(b2);
        } else {
            b2Bounds = new Rectangle();
        }
        if (b3 != null) {
            b3Bounds = this.computeUnion(b3);
        } else {
            b3Bounds = new Rectangle();
        }

        // First compute the preferred new width which is
        // the max of all the widths;
        newRight = Math.max(Math.max((b1Bounds.x + b1Bounds.width),
            (b2Bounds.x + b2Bounds.width)),
            (b3Bounds.x + b3Bounds.width));

        // Then, fix up each region that is not the same width
        if (b1 !== null) {
            if ((b1Bounds.x + b1Bounds.width) !== newRight) {
                dx = newRight - (b1Bounds.x + b1Bounds.width);
                right = b1Bounds.x + b1Bounds.width;
                for (var i = 0; i < b1.length; i++) {
                    if ((b1[i].x + b1[i].width) === right) {
                        b1[i].width += dx;
                    }
                }
            }
        }
        if (b2 !== null) {
            if ((b2Bounds.x + b2Bounds.width) !== newRight) {
                dx = newRight - (b2Bounds.x + b2Bounds.width);
                right = b2Bounds.x + b2Bounds.width;
                for (var i = 0; i < b2.length; i++) {
                    if ((b2[i].x + b2[i].width) === right) {
                        b2[i].width += dx;
                    }
                }
            }
        }
        if (b3 !== null) {
            if ((b3Bounds.x + b3Bounds.width) !== newRight) {
                dx = newRight - (b3Bounds.x + b3Bounds.width);
                right = b3Bounds.x + b3Bounds.width;
                for (var i = 0; i < b3.length; i++) {
                    if ((b3[i].x + b3[i].width) === right) {
                        b3[i].width += dx;
                    }
                }
            }
        }
    }

    /**
     *
     * @param {Rectangle} b1
     * @param {Rectangle[]} b2
     */
    evenBoxHeight2(b1 = null, b2 = null) {

        if ((b1 === null) || (b2 === null)) {
            return;
        }

        var b1boxes = [];
        b1boxes[0] = b1;
        this.evenBoxHeight3(b1boxes, b2, null);
    }

    /**
     * Probably set height to be equal on 3 boxes
     * @param {Rectangle[]} b1
     * @param {Rectangle[]} b2
     * @param {Rectangle[]} b3
     */
    evenBoxHeight3(b1, b2, b3) {
        var dy = 0;
        var bottom;
        var newBottom;
        var b1Bounds, b2Bounds, b3Bounds;
        // Compute the actual bounds of the 3 regions
        if (b1 != null) {
            b1Bounds = this.computeUnion(b1);
        } else {
            b1Bounds = new Rectangle();
        }
        if (b2 != null) {
            b2Bounds = this.computeUnion(b2);
        } else {
            b2Bounds = new Rectangle();
        }
        if (b3 != null) {
            b3Bounds = this.computeUnion(b3);
        } else {
            b3Bounds = new Rectangle();
        }

        // Then, compute the preferred new height which is
        // the max of all the heights;
        newBottom = Math.max(Math.max((b1Bounds.y + b1Bounds.height),
            (b2Bounds.y + b2Bounds.height)),
            (b3Bounds.y + b3Bounds.height));

        // Then, fix up each region that is not the same height
        if (b1 !== null) {
            if ((b1Bounds.y + b1Bounds.height) !== newBottom) {
                dy = newBottom - (b1Bounds.y + b1Bounds.height);
                bottom = b1Bounds.y + b1Bounds.height;
                for (var i = 0; i < b1.length; i++) {
                    if ((b1[i].y + b1[i].height) === bottom) {
                        b1[i].height += dy;
                    }
                }
            }
        }
        if (b2 !== null) {
            if ((b2Bounds.y + b2Bounds.height) !== newBottom) {
                dy = newBottom - (b2Bounds.y + b2Bounds.height);
                bottom = b2Bounds.y + b2Bounds.height;
                for (var i = 0; i < b2.length; i++) {
                    if ((b2[i].y + b2[i].height) === bottom) {
                        b2[i].height += dy;
                    }
                }
            }
        }
        if (b3 !== null) {
            if ((b3Bounds.y + b3Bounds.height) !== newBottom) {
                dy = newBottom - (b3Bounds.y + b3Bounds.height);
                bottom = b3Bounds.y + b3Bounds.height;
                for (var i = 0; i < b3.length; i++) {
                    if ((b3[i].y + b3[i].height) === bottom) {
                        b3[i].height += dy;
                    }
                }
            }
        }
    }

    /**
     * @param {Number} numItems
     * @param {Number} ar aspectRatio
     * @returns {Dimension}
     */
    computeTableLayout(numItems, ar) {
        var w, h;

        if (ar >= 1) {
            h = Math.ceil(Math.sqrt(numItems / ar));
            if (h === 0) {
                h = 1;
            }
            w = (numItems / h);
            if ((h * w) < numItems) {
                w++;
                h--;
            }
            while ((h * w) < numItems) {
                h++;
            }
        } else {
            w = Math.ceil(Math.sqrt(numItems * ar));
            if (w === 0) {
                w = 1;
            }
            h = (numItems / w);
            if ((h * w) < numItems) {
                h++;
                w--;
            }
            while ((h * w) < numItems) {
                w++;
            }
        }

        return new Dimension(w+this.horizontalPadding, h+this.verticalPadding);
    }

    /**
     *
     * @param {Number} numItems
     * @param {Number} width
     * @returns {Dimension}
     */
    computeTableLayoutGivenWidth(numItems, width) {
        var h;

        if (width < 1) {
            width = 1;
        }
        h = Math.ceil(numItems / width);

        return new Dimension(width+this.horizontalPadding, h+this.verticalPadding);
    }

    /**
     * @param {Number} numItems
     * @param {Number} height
     * @returns {Dimension}
     */
    computeTableLayoutGivenHeight(numItems, height) {
        var w;

        if (height < 1) {
            height = 1;
        }
        w = Math.ceil(numItems / height);
        return new Dimension(w+this.horizontalPadding, height+this.verticalPadding);
    }
}
