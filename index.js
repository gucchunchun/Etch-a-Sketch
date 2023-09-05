"use strict";
var ColorOption;
(function (ColorOption) {
    ColorOption["Red"] = "red";
    ColorOption["Green"] = "green";
    ColorOption["Blue"] = "blue";
    ColorOption["Alfa"] = "alfa";
})(ColorOption || (ColorOption = {}));
const defaultColor = {
    [ColorOption.Red]: 255,
    [ColorOption.Green]: 255,
    [ColorOption.Blue]: 255,
    [ColorOption.Alfa]: 1,
};
class Box {
    constructor(_sketch, _width, _color = JSON.parse(JSON.stringify(defaultColor)), _classList = []) {
        this._sketch = _sketch;
        this._width = _width;
        this._color = _color;
        this._classList = _classList;
        this.self = undefined;
    }
    add(insertBeforeElement = undefined) {
        let self = document.createElement('div');
        //default className
        self.classList.add('sketch__box');
        //additional className for style changes
        for (const name of this._classList) {
            self.classList.add(name);
        }
        self.style.width = this._width + 'px';
        self.style.height = this._width + 'px';
        self.style.backgroundColor = `rgba(${this._color[ColorOption.Red]}, ${this._color[ColorOption.Green]},${this._color[ColorOption.Blue]},${this._color[ColorOption.Alfa]})`;
        self.addEventListener('mousedown', () => {
            //some function to change color with specified color
        });
        if (insertBeforeElement) {
            this._sketch.insertBefore(self, insertBeforeElement);
        }
        else {
            this._sketch.appendChild(self);
        }
        this.self = self;
    }
    update(updateFeature) {
        let box = this.self;
        if (!box) {
            throw new Error('Target box element can not be found');
        }
        if (updateFeature.width) {
            this._width = updateFeature.width;
            box.style.width = this._width + '%';
        }
        // color is more primary than getting random color with colorOptions
        if (updateFeature.color) {
            this._color = updateFeature.color;
            box.style.backgroundColor = `rgba(${this._color[ColorOption.Red]}, ${this._color[ColorOption.Green]},${this._color[ColorOption.Blue]},${this._color[ColorOption.Alfa]})`;
        }
        if (updateFeature.classList) {
            this._classList = updateFeature.classList;
            const boxClassList = box.classList;
            // Remove any class not present in the updated class list
            for (const name of boxClassList) {
                if (name !== 'sketch__box' && !this._classList.includes(name)) {
                    boxClassList.remove(name);
                }
            }
            // Add any new classes from the updated class list
            for (const newName of this._classList) {
                if (newName !== 'sketch__box' && !boxClassList.contains(newName)) {
                    boxClassList.add(newName);
                }
            }
        }
    }
}
var BoxWidth;
(function (BoxWidth) {
    BoxWidth[BoxWidth["Small"] = 8] = "Small";
    BoxWidth[BoxWidth["Medium"] = 16] = "Medium";
    BoxWidth[BoxWidth["Large"] = 24] = "Large";
})(BoxWidth || (BoxWidth = {}));
class Sketch {
    constructor(_self, _boxWidth = BoxWidth.Medium) {
        this._self = _self;
        this._boxWidth = _boxWidth;
        this._boxes = [];
    }
    initBoxes() {
        const sketchWidth = this._self.clientWidth;
        const sketchHeight = this._self.clientHeight;
        const row = Math.ceil(sketchWidth / this._boxWidth);
        const col = Math.ceil(sketchHeight / this._boxWidth);
        this._self.style.gridTemplateColumns
            = `repeat(${row}, ${this._boxWidth}px)`;
        this._self.style.gridTemplateRows
            = `repeat(${col}, ${this._boxWidth}px)`;
        for (let i = 0; i < row; i++) {
            this._boxes.push([]);
            for (let j = 0; j < col; j++) {
                const box = new Box(this._self, this._boxWidth, undefined, ['border']);
                box.add();
                this._boxes[i].push(box);
            }
        }
    }
    deleteAllBox() {
        for (let i = 0; i < this._boxes.length; i++) {
            for (let j = 0; j < this._boxes[i].length; j++) {
                const box = this._boxes[i][j].self;
                if (!box) {
                    throw new Error(`box position ${i - j} is not found`);
                }
                else {
                    this._self.removeChild(box);
                }
            }
        }
    }
    updateAllBoxColor(newColor) {
        for (let i = 0; i < this._boxes.length; i++) {
            for (let j = 0; j < this._boxes[i].length; j++) {
                this._boxes[i][j].update({ color: newColor });
            }
        }
    }
    updateBoxWidth(width) {
        this._boxWidth = width;
        //add sa
        this.deleteAllBox();
        this.initBoxes();
    }
}
const sketchDiv = document.querySelector('#sketch');
if (!sketchDiv) {
    throw new Error('div for sketch is not found');
}
//initialize sketch
const sketch = new Sketch(sketchDiv);
sketch.initBoxes();
window.addEventListener('resize', () => {
    sketch.deleteAllBox();
    sketch.initBoxes();
});
//# sourceMappingURL=index.js.map