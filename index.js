"use strict";
var ColorOption;
(function (ColorOption) {
    ColorOption["Red"] = "red";
    ColorOption["Green"] = "green";
    ColorOption["Blue"] = "blue";
    ColorOption["Alfa"] = "alfa";
})(ColorOption || (ColorOption = {}));
const defaultBgColor = {
    [ColorOption.Red]: 255,
    [ColorOption.Green]: 255,
    [ColorOption.Blue]: 255,
    [ColorOption.Alfa]: 1,
};
const defaultNextColor = {
    [ColorOption.Red]: 0,
    [ColorOption.Green]: 0,
    [ColorOption.Blue]: 0,
    [ColorOption.Alfa]: 1,
};
class Box {
    constructor(_sketch, _width, _bgColor = JSON.parse(JSON.stringify(defaultBgColor)), _nextColor = JSON.parse(JSON.stringify(defaultNextColor)), _classList = []) {
        this._sketch = _sketch;
        this._width = _width;
        this._bgColor = _bgColor;
        this._nextColor = _nextColor;
        this._classList = _classList;
        this.self = undefined;
        this.colored = this.colored.bind(this);
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
        self.style.backgroundColor = `rgba(${this._bgColor[ColorOption.Red]}, ${this._bgColor[ColorOption.Green]},${this._bgColor[ColorOption.Blue]},${this._bgColor[ColorOption.Alfa]})`;
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
            this._bgColor = updateFeature.color;
            box.style.backgroundColor = `rgba(${this._bgColor[ColorOption.Red]}, ${this._bgColor[ColorOption.Green]},${this._bgColor[ColorOption.Blue]},${this._bgColor[ColorOption.Alfa]})`;
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
    colored() {
        let box = this.self;
        if (!box) {
            throw new Error('Target box element can not be found');
        }
        else {
            box.style.backgroundColor = `rgba(${this._nextColor[ColorOption.Red]}, ${this._nextColor[ColorOption.Green]},${this._nextColor[ColorOption.Blue]},${this._nextColor[ColorOption.Alfa]})`;
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
    constructor(_container, _self, _boxWidth = BoxWidth.Medium, _bgColor = JSON.parse(JSON.stringify(defaultBgColor)), _nextColor = JSON.parse(JSON.stringify(defaultNextColor))) {
        this._container = _container;
        this._self = _self;
        this._boxWidth = _boxWidth;
        this._bgColor = _bgColor;
        this._nextColor = _nextColor;
        this._boxes = [];
        this.sketchStart = this.sketchStart.bind(this);
        this.sketchStop = this.sketchStop.bind(this);
    }
    initBoxes() {
        const sketchWidth = this._container.clientWidth;
        const sketchHeight = this._container.clientHeight;
        const col = Math.ceil(sketchWidth / this._boxWidth);
        const row = Math.ceil(sketchHeight / this._boxWidth);
        this._self.style.gridTemplateColumns
            = `repeat(${col}, ${this._boxWidth}px)`;
        this._self.style.gridTemplateRows
            = `repeat(${row}, ${this._boxWidth}px)`;
        for (let i = 0; i < row; i++) {
            this._boxes.push([]);
            for (let j = 0; j < col; j++) {
                const box = new Box(this._self, this._boxWidth, this._bgColor, this._nextColor, ['border']);
                box.add();
                this._boxes[i].push(box);
            }
        }
        this._self.addEventListener('mousedown', this.sketchStart);
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
        this._boxes = [];
    }
    updateBoxColor(newColor = this._nextColor, percents = 100, eraser = false) {
        const row = this._boxes.length;
        let col = this._boxes[0].length;
        const color = eraser ? this._bgColor : newColor;
        col = Math.round(col * percents / 100);
        for (let i = 0; i < row; i++) {
            for (let j = 0; j < col; j++) {
                this._boxes[i][j].update({ color: color });
            }
        }
    }
    updateBoxWidth(width) {
        this._boxWidth = width;
        //add sa
        this.deleteAllBox();
        this.initBoxes();
    }
    sketchStart() {
        console.log(this._boxes);
        for (let i = 0; i < this._boxes.length; i++) {
            for (let j = 0; j < this._boxes[i].length; j++) {
                let box = this._boxes[i][j];
                if (!box.self) {
                    throw new Error(`box position ${i - j} is not found`);
                }
                else {
                    box.self.addEventListener("mouseenter", box.colored);
                }
            }
        }
        this._self.addEventListener('mouseup', this.sketchStop);
    }
    sketchStop() {
        for (let i = 0; i < this._boxes.length; i++) {
            for (let j = 0; j < this._boxes[i].length; j++) {
                let box = this._boxes[i][j];
                if (!box.self) {
                    box;
                    throw new Error(`box position ${i - j} is not found`);
                }
                else {
                    box.self.removeEventListener("mouseenter", box.colored);
                }
            }
        }
        this._self.removeEventListener('mouseup', this.sketchStop);
    }
}
const sketchDiv = document.querySelector('#sketch');
const sketchBoxCtr = document.querySelector('#box-ctr');
const eraser = document.querySelector('#eraser');
//initialize sketch
const sketch = new Sketch(sketchDiv, sketchBoxCtr);
sketch.initBoxes();
function boxReinitialize() {
    sketch.deleteAllBox();
    sketch.initBoxes();
}
window.addEventListener('resize', boxReinitialize);
eraser === null || eraser === void 0 ? void 0 : eraser.addEventListener('input', (e) => {
    if (!e.target) {
        throw new Error(`${e}'s target can not be found`);
    }
    else {
        const input = e.target;
        const percents = parseInt(input.value);
        sketch.updateBoxColor(undefined, percents, true);
    }
});
//# sourceMappingURL=index.js.map