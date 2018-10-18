const assert = require("assert");

const serialijse = require("serialijse");

const WidgetConnector = require("./widget_connector").WidgetConnector;
const WidgetBase = require("./widget_base").WidgetBase;
const WidgetCollection = require("./widget_collection").WidgetCollection;
const WidgetBaseConn = require("./widget_base_conn").WidgetBaseConn;
const WidgetConnectorList = require("./widget_connector_list").WidgetConnectorList;


class Expression {
    constructor(exp) {
        this.exp = exp || "0";
    }

    set(exp) {
        this.exp = exp;
        // to do : verify syntax and throw if necessary
    }

    toScript() {
        return this.exp;
    }

    clone() {
        const clone = new Expression();
        clone.exp = this.exp;
        return clone;
    }
}

class ExpressionPoint {

    constructor(exprX, exprY, exprZ) {
        this.X = new Expression(exprX);
        this.Y = new Expression(exprY);
        this.Z = new Expression(exprZ);
    }

    set(exprX, exprY, exprZ) {
        this.X.set(exprX);
        this.Y.set(exprY);
        this.Z.set(exprZ);
    }

    toScript() {
        return "[" + this.X.toScript() + "," + this.Y.toScript() + "," + this.Z.toScript() + "]";
    }

    clone() {
        const clone = new ExpressionPoint();
        clone.X = this.X.clone();
        clone.Y = this.Y.clone();
        clone.Z = this.Z.clone();
        return clone;
    }
}

let future_GeomBase;

class ShapeConnector extends WidgetConnector {

    constructor(parent) {
        super(parent);
    }

    isValidConnectedObject(object) {
        assert(object, "expecting a valid object");
        return object instanceof future_GeomBase;
    }
}

class GeomBase extends WidgetBase {

    constructor(name/*: string*/) {
        super(name);
        this.origin = {
            libGUID: "",
            libName: "",
            geometryName: ""
        };
        this.isVisible = true;
    }

    clone() {
        throw new Error("Not Implemented");
    }

    getShapeConnectors() {
        return this.getWidgetConnectors().filter(connector => (connector instanceof ShapeConnector));
    }

    getDependantShapes() {
        return this.getDependantEntities().filter(widget => (widget instanceof GeomBase));
    }

    breakDependancyItem() {

    }
}

future_GeomBase = GeomBase;


class GeomPrimitive extends GeomBase {

}

class GeomPrimitiveObject extends GeomPrimitive {

    constructor(name) {
        super(name);
        this.geometries = []; // GeomPrimitives
        this.parameters = []; // GeomParameters
    }


    getName() {
        return this.geometries.length > 0 ? this.geometries[0].name : null;
        // return this.geometries.map(x => x.name).join("U");
    }

    getLibGUID() {
        return this.geometries[0].geometriesLibGUID;
    }

    toScript() {
        // return csg.makeCylinder;// this.geometries.map(x => x.toScript()).join("\n");

        let stringToReturn = (this.geometries.length > 0) ? this.geometries[0].toScript().slice(0, -1) : "null";

        // for (var j = 1; j < this.parameters.length; j++) {
        //
        // }

        for (var j = 1; j < this.geometries.length; j++) {

            stringToReturn = "csg.fuse(" + this.geometries[j].toScript().slice(0, -1) + "," + stringToReturn + ")";

        }
        return stringToReturn;
    }

    clone() {
        const clone = new GeomPrimitiveObject();
        clone.geometries = this.geometries;
        clone.origin = this.origin;
        clone.parameters = this.parameters;
        clone.isVisible = this.isVisible;
        return clone;
    }
}

class GeomPrimitiveBox extends GeomPrimitive {

    constructor(name) {
        super(name);
        this.point1 = new ExpressionPoint();
        this.point2 = new ExpressionPoint();
    }

    toScript() {
        return "csg.makeBox("
            + this.point1.toScript() + ","
            + this.point2.toScript() + ");";
    }

    clone() {
        const clone = new GeomPrimitiveBox();
        clone.name = this.name;
        clone.point1 = this.point1.clone();
        clone.point2 = this.point2.clone();
        clone.isVisible = this.isVisible;
        return clone;
    }
}

class GeomPrimitiveCylinder extends GeomPrimitive {

    constructor(name) {
        super(name);
        this.point1 = new ExpressionPoint();
        this.point2 = new ExpressionPoint();
        this.radius = new Expression();
    }

    toScript() {
        return "csg.makeCylinder("
            + this.point1.toScript() + ","
            + this.point2.toScript() + ","
            + this.radius.toScript() + ");";
    }

    clone() {
        const clone = new GeomPrimitiveCylinder();
        clone.name = this.name;
        clone.point1 = this.point1.clone();
        clone.point2 = this.point2.clone();
        clone.radius = this.radius.clone();
        clone.isVisible = this.isVisible;
        return clone;
    }

}

class GeomPrimitiveCone extends GeomPrimitive {

    constructor(name) {
        super(name);
        this.point1 = new ExpressionPoint();
        this.radius1 = new Expression();
        this.point2 = new ExpressionPoint();
        this.radius2 = new Expression();
    }

    toScript() {
        return "csg.makeCone("
            + this.point1.toScript() + ","
            + this.radius1.toScript() + ","
            + this.point2.toScript() + ","
            + this.radius2.toScript() + ");";
    }

    clone() {
        const clone = new GeomPrimitiveCone();
        clone.name = this.name;
        clone.point1 = this.point1.clone();
        clone.radius1 = this.radius1.clone();
        clone.point2 = this.point2.clone();
        clone.radius2 = this.radius2.clone();
        clone.isVisible = this.isVisible;
        return clone;
    }
}

class GeomPrimitiveSphere extends GeomPrimitive {

    constructor(name) {
        super(name);
        this.center = new ExpressionPoint();
        this.radius = new Expression();
    }

    toScript() {
        return "csg.makeSphere("
            + this.center.toScript() + ","
            + this.radius.toScript() + ");";
    }

    clone() {
        const clone = new GeomPrimitiveSphere();
        clone.name = this.name;
        clone.center = this.center.clone();
        clone.radius = this.radius.clone();
        clone.isVisible = this.isVisible;
        return clone;
    }

}

class GeomPrimitiveTorus extends GeomPrimitive {

    constructor(name) {
        super(name);
        this.center = new ExpressionPoint();
        this.axis = new ExpressionPoint();
        this.mainRadius = new Expression();
        this.smallRadius = new Expression();
    }

    toScript() {
        return "csg.makeTorus("
            + this.center.toScript() + ","
            + this.axis.toScript() + ","
            + this.mainRadius.toScript() + ","
            + this.smallRadius.toScript() + ");";
    }

    clone() {
        const clone = new GeomPrimitiveTorus();
        clone.name = this.name;
        clone.center = this.center.clone();
        clone.axis = this.axis.clone();
        clone.mainRadius = this.mainRadius.clone();
        clone.smallRadius = this.smallRadius.clone();
        clone.isVisible = this.isVisible;
        return clone;
    }

}


class GeomOperation extends GeomBase {

    constructor(name, arg1, arg2) {
        super(name);
        assert(!arg1 || arg1 instanceof GeomBase);
        assert(!arg2 || arg2 instanceof GeomBase);

        this.leftArg = new ShapeConnector(this);
        this.rightArg = new ShapeConnector(this);

        if (arg1) {
            this.leftArg.set(arg1);
        }
        if (arg2) {
            this.rightArg.set(arg2);
        }
    }

}

function t(arg) {

    assert(arg instanceof ShapeConnector, "expecting a ShapeConnector");

    // Simple geoemtries
    if (arg.get() && !arg.get().geometries) {
        return arg.get().name;
    }

    // CompoundObject
    if (arg.get() && arg.get().geometries) {
        return arg.get().getName();
    }

    return "null";
}

class GeomOperationCut extends GeomOperation {

    constructor(name, arg1, arg2) {
        super(name, arg1, arg2);
    }

    toScript() {
        return "csg.cut(" + t(this.leftArg) + "," + t(this.rightArg) + ");";
    }

    clone() {
        const clone = new GeomOperationCut(this.name);
        clone.leftArg.set(this.leftArg.get());
        clone.rightArg.set(this.rightArg.get());
        clone.isVisible = this.isVisible;
        return clone;
    }
}

class GeomOperationFuse extends GeomOperation {

    constructor(name, arg1, arg2) {
        super(name, arg1, arg2);
    }

    toScript() {
        return "csg.fuse(" + t(this.leftArg) + "," + t(this.rightArg) + ");";
    }

    clone() {
        const clone = new GeomOperationFuse(this.name);
        clone.leftArg.set(this.leftArg.get());
        clone.rightArg.set(this.rightArg.get());
        clone.isVisible = this.isVisible;
        return clone;
    }

}

class GeomOperationCommon extends GeomOperation {
    constructor(name, arg1, arg2) {
        super(name, arg1, arg2);
    }

    toScript() {
        return "csg.common(" + t(this.leftArg) + "," + t(this.rightArg) + ");";
    }

    clone() {
        const clone = new GeomOperationCommon(this.name);
        clone.leftArg.set(this.leftArg.get());
        clone.rightArg.set(this.rightArg.get());
        clone.isVisible = this.isVisible;
        return clone;
    }

}

class GeomTransfo extends GeomBase {

    constructor(name) {
        super(name);
        this.geometry = new ShapeConnector(this);
    }

    setGeometry(geo) {
        assert(geo instanceof GeomBase);
        assert(this.geometry instanceof ShapeConnector);
        this.geometry.set(geo);
    }
}


class GeomTransfoTranslate extends GeomTransfo {

    constructor(name) {
        super(name);
        this.vector = new ExpressionPoint();
        this.batchItems = [];
        this.times = new Expression();
        this.times.set(1);
    }

    toScript() {
        const it = Math.floor(parseFloat(this.times.toScript()));
        if (this.batchItems.length == 0 && it==1) {
            return t(this.geometry) + ".translate(" +
                this.vector.toScript() + ");";
        }
        else {


            let res = [];
            this.batchItems.forEach(l => {
                l.vector = this.vector;

                let stringToReturn = "";
                if (it > 1) {
                    stringToReturn = batchTranslateOn(stringToReturn, l.vector, l.geometry, it);
                    res.push(stringToReturn)
                }
                else {
                    res.push(
                        t(l.geometry) + ".translate(" +
                        l.vector.toScript() + ")"
                    )
                }
            });

            // let strRes = "";
            // for (var i = 0; i < res.length; i++) {
            //     strRes += "var " + this.batchItems[i].name + "_plus_" + i + " = " + res[i] + "\n";
            //
            // }


            // let str = "var " + item.name + " = ";
            // str += item.toScript(context);
            //
            // if (item.isVisible) {
            //     str += "\ndisplay(" + item.name + ");";
            // }
            // return str;


            let res2 = "";
            if (it > 1) {
                res2 = batchTranslateOn(res2, this.vector, this.geometry, it);
            }
            else {
                res2 = t(this.geometry) + ".translate(" +
                    this.vector.toScript() + ")";
            }

            for (var i = 0; i < res.length; i++) {
                res2 = "csg.fuse(" + res[i] + ", " + res2 + ")";

            }

            return res2;
        }
    }

    clone() {
        const clone = new GeomTransfoTranslate();
        clone.name = this.name;
        clone.geometry.set(this.geometry.get());
        clone.vector = this.vector.clone();
        clone.batchItems = this.batchItems;
        clone.isVisible = this.isVisible;
        clone.times = this.times;
        return clone;
    }

}

class GeomTransfoRotate extends GeomTransfo {

    constructor(name) {
        super(name);
        this.center = new ExpressionPoint();
        this.axis = new ExpressionPoint();
        this.angle = new Expression();
        this.batchItems = [];
        this.times = new Expression();
        this.times.set(1);
    }

    toScript() {
        const it = Math.floor(parseFloat(this.times.toScript()));
        if (this.batchItems.length == 0  && it==1) {
            return t(this.geometry) + ".rotate(" +
                this.center.toScript() + "," +
                this.axis.toScript() + "," +
                this.angle.toScript() + ");";
        }
        else {

            let res = [];
            this.batchItems.forEach(l => {

                l.center = this.center;
                l.axis = this.axis;
                l.angle = this.angle;

                let stringToReturn = "";
                if (it > 1) {
                    stringToReturn = batchRotateOn(stringToReturn, l.center, l.axis, l.angle, l.geometry, it);
                    res.push(stringToReturn);
                }
                else {
                    res.push(
                        t(l.geometry) + ".rotate(" +
                        l.center.toScript() + "," +
                        l.axis.toScript() + "," +
                        l.angle.toScript() + ")"
                    )
                }

            });


            let res2 = "";
            if (it > 1) {
                res2 = batchRotateOn(res2, this.center, this.axis, this.angle, this.geometry, it);
            }
            else {
                res2 =  t(this.geometry) + ".rotate(" +
                    this.center.toScript() + "," +
                    this.axis.toScript() + "," +
                    this.angle.toScript() + ")"
            }

            for (var i = 0; i < res.length; i++) {
                res2 = "csg.fuse(" + res[i] + ", " + res2 + ")";
            }

            return res2;
        }

    }

    clone() {
        const clone = new GeomTransfoRotate();
        clone.name = this.name;
        clone.geometry.set(this.geometry.get());
        clone.center = this.center.clone();
        clone.axis = this.axis.clone();
        clone.angle = this.angle.clone();
        clone.isVisible = this.isVisible;
        clone.batchItems = this.batchItems;
        clone.times = this.times;
        return clone;
    }
}


function batchRotateOn(stringToReturn, center, axis, angle, geometry, it) {
    const name = (geometry.name) ? (geometry.name) : (t(geometry));
    for (var j = 1; j < it; j++) {

        stringToReturn = "csg.fuse(" + name + ".rotate(" +
            center.toScript() + "," +
            axis.toScript() + "," +
            "(" + angle.toScript() + ") * " + j + ")," + (stringToReturn || name) + ")";

    }
    return stringToReturn;

}

function batchTranslateOn(stringToReturn, vector, geometry, it) {

    const name = (geometry.name) ? (geometry.name) : (t(geometry));
    for (var j = 1; j < it; j++) {
        const currentVector = new ExpressionPoint(
            "(" + vector.X.toScript() + ") * " + j,
            "(" + vector.Y.toScript() + ") * " + j,
            "(" + vector.Z.toScript() + ") * " + j);
        stringToReturn = "csg.fuse(" + name + ".translate(" +
            currentVector.toScript() + ")," + (stringToReturn || name) + ")";
    }
    return stringToReturn;

}

class GeomTransfoBatch extends GeomTransfo {


    constructor(name) {

        super(name);

        this.transformType = "Translate";
        this.times = new Expression();
        this.times.set(2);

        this.unlinked = false;

        this.unlinkedTimes = new Expression();
        this.unlinkedTimes.set(2);

        this.center = new ExpressionPoint();
        this.axis = new ExpressionPoint();
        this.angle = new Expression();

        this.vector = new ExpressionPoint();

        this.additionalSource = null;
        this.additionalSourceName = "";

    }

    setSelectedTransform(string) {
        this.transformType = string;
    }

    toScript() {

        let stringToReturn = "";

        let it;
        if (!this.unlinked) {
            it = Math.floor(parseFloat(this.times.toScript()));
        }
        else {
            it = Math.floor(parseFloat(this.unlinkedTimes.toScript()));
        }
        if (this.transformType == "Rotate") {
            stringToReturn = batchRotateOn(stringToReturn, this.center, this.axis, this.angle, this.geometry, it);
            // if (this.additionalSourceName !== '') {
            //     stringToReturn = batchRotateOn(stringToReturn, this.center, this.axis, this.angle, this.additionalSource, it);
            // }
        }
        else {
            stringToReturn = batchTranslateOn(stringToReturn, this.vector, this.geometry, it);
            // if (this.additionalSourceName !== '') {
            //     stringToReturn = batchTranslateOn(stringToReturn, this.vector, this.additionalSource, it);
            // }
        }


        stringToReturn += ";"
        return stringToReturn || "null;";
    }

    clone() {
        const clone = new GeomTransfoBatch();
        clone.name = this.name;
        clone.geometry.set(this.geometry.get());

        clone.vector = this.vector.clone();

        clone.center = this.center.clone();
        clone.axis = this.axis.clone();
        clone.angle = this.angle.clone();

        clone.transformType = this.transformType;
        clone.times = this.times;
        clone.isVisible = this.isVisible;

        return clone;
    }
}


class GeomTransfoClone extends GeomTransfo {

    constructor(name) {
        super(name);
        this.batchItems = [];
        this.vector = new ExpressionPoint();
    }

    toScript() {
        return t(this.geometry) + ".translate(" +
            this.vector.toScript() + ");";
    }

    clone() {
        const clone = new GeomTransfoClone();
        clone.name = this.name;
        clone.batchItems = this.batchItems;
        clone.geometry.set(this.geometry.get());
        clone.vector = this.vector.clone();
        clone.isVisible = this.isVisible;
        return clone;
    }

}


class GeometryEditor extends WidgetCollection {

    constructor(options) {
        super();
    }

    getWidgetBaseClass() {
        return GeomBase;
    }

    getPersistedObjects() {
        let a = [];
        this.items.map(x => {
            if (!!x.geometries) {
                a.push(x);
            }
        });

        return a;
    }

    _registerShape(shape) {
        assert(shape instanceof GeomBase);
        return this._registerWidget(shape);
    }

    addObject() {
        const shape = new GeomPrimitiveObject(this.__getNextName());
        // shape.geometries = [];
        return this._registerShape(shape);
    }

    // addObjectTrunk() {
    //     const shape = new GeomPrimitiveObject(this.__getNextName());
    //     // shape.geometries = [];
    //     return this._registerShape(shape);
    // }

    addBox() {
        const shape = new GeomPrimitiveBox(this.__getNextName());
        shape.point2.set(10, 10, 10);
        return this._registerShape(shape);
    }

    addCylinder() {
        const shape = new GeomPrimitiveCylinder(this.__getNextName());
        return this._registerShape(shape);
    }

    addCone() {
        const shape = new GeomPrimitiveCone(this.__getNextName());
        return this._registerShape(shape);
    }

    addSphere() {
        const shape = new GeomPrimitiveSphere(this.__getNextName());
        return this._registerShape(shape);
    }

    addTorus() {
        const shape = new GeomPrimitiveTorus(this.__getNextName());
        return this._registerShape(shape);
    }

    // ---------------------- Operations
    addCutOperation(geometry1, geometry2) {
        const shape = new GeomOperationCut(this.__getNextName(), geometry1, geometry2);
        return this._registerShape(shape);
    }

    addFuseOperation(geometry1, geometry2) {
        const shape = new GeomOperationFuse(this.__getNextName(), geometry1, geometry2);
        return this._registerShape(shape);
    }

    addCommonOperation(geometry1, geometry2) {
        const shape = new GeomOperationCommon(this.__getNextName(), geometry1, geometry2);
        return this._registerShape(shape);
    }

    // ---------------------- Transformation
    addRotation() {
        const shape = new GeomTransfoRotate(this.__getNextName());
        return this._registerShape(shape);
    }

    addTranslation() {
        const shape = new GeomTransfoTranslate(this.__getNextName());
        return this._registerShape(shape);
    }

    addClone() {
        const shape = new GeomTransfoClone(this.__getNextName());
        return this._registerShape(shape);
    }


    addBatch() {
        const shape = new GeomTransfoBatch(this.__getNextName());
        return this._registerShape(shape);
    }

    __getNextName() {
        return this.__getNextNameWithPrefix("shape");
    }

    convertToScript() {

        const context = {};

        function convertItemToScript(item) {
            let str = "var " + item.name + " = ";
            str += item.toScript(context);

            if (item.isVisible) {
                str += "\ndisplay(" + item.name + ");";
            }
            return str;
        }
        function convertParameterToScript(param) {
            const value = (param.value === null || param.value === undefined) ? param.defaultValue : param.value;
            if (isNaN(value) && typeof value === "string"){
                return "var $" + param.id + " = '" + value + "';";
            }
            return "var $" + param.id + " = " + value + ";";
        }

        let lines = [];
        const parameters = this.getParameters();
        lines = lines.concat(parameters.map(convertParameterToScript));
        lines = lines.concat(this.items.map(convertItemToScript));
        return lines.join("\n");
    }

    /**
     *
     * @param parameters
     * @example:
     *    g.setParameters(   [ {id:"length",value: 10},{ id:"thickness", value: 1}]);
     */
    setParameters(parameters) {
        assert(parameters instanceof Array, "expecting an array here. for instance [{id:1,defaultValue:10}]");
        this._parameters = parameters;
    }

    getParameters() {
        // _parameters on a Geometry (Geometry to display)
        // parametersEditor on a GeometryObject (shared Geometry in a Library)
        let parameters;
        if (this.parametersEditor) {
            return this._parameters || this.parametersEditor.items;
        }
        return this._parameters || [];
    }

    setParameter(param, value) {
        const params = this.getParameters();
        const index = params.findIndex(p => p.id == param);
        if (index < 0) {
            this._parameters.push({id: param, value: value});
            return;
        }
        this._parameters[index].value = value;
    }

    clone() {
        const clone = this.extractSubset(this.items);
        //xx clone._parameters = JSON.parse(JSON.stringify(this._parameters));
        clone._parameters = this._parameters.map(a => Object.assign({}, a));
        clone.items.forEach(i => {

            // Si Géométrie composite en tant qu'objet et sans lien persistant
            if (!!i.geometries && i.origin.libGUID == "") {
                const found = this.items.filter(w => w.$$hashKey == i.$$hashKey)[0];
                if (!!found && typeof found.geometries === 'Array' && found.geometries.length > 0) {
                    i.parameters = found.geometries[0].parameters
                }
                if (i.geometries.length > 0 && i.geometries[0].parameters) {
                    i.parameters = i.geometries[0].parameters;
                }
            }


            // Si géométrie composite importée en tant qu'objet avec lien persistant
            // origin.libGUID = originalItem.geometriesLibGUID;
            // i.origin = originalItem.origin;
            // Utilisation de origin.libGUID dans le geometryEditor pour reconstruire la géométrie avec lien persistant
            else if (!!i.geometries && i.origin.libGUID != "") {


            }
            // Si Géométrie composite importée en avec toutes les sous géométries visibles dans l'étude
            else {
                const originalItem = this.items.filter(w => {
                    return w.name == i.name
                })[0];

                i.origin = originalItem.origin;

                if (!!originalItem && originalItem.parameters) {
                    originalItem.parameters.forEach(p => {
                        if (p.id.indexOf(originalItem.origin.geometryName) == -1 && p.id.indexOf(originalItem.origin.libName) == -1) {
                            p.id = p.id + "_" + originalItem.origin.geometryName + "_" + originalItem.origin.libName;
                            p.name = p.name + "_" + originalItem.origin.geometryName + "_" + originalItem.origin.libName;
                        }
                    });
                    this.items.forEach(a => {
                        i.parameters = _.concat(i.parameters, a.parameters);
                        i.parameters = _.uniq(i.parameters, function (w) {
                            if (w) {
                                return w.name
                            }
                            return false;
                        });
                    })
                }
            }


        });
        return clone;
    }

    overrideGeomObjectParameters() {

        const items = this.items;
        items.forEach(item => {

            if (item instanceof GeomPrimitiveObject) {
                item.parameters.forEach(p => {
                    p.id = p.id + "_" + item.getName() + "_" + item.getLibGUID();
                    p.name = p.name + "_" + item.getName() + "_" + item.getLibGUID();
                    p.displayName = p.displayName + "_" + item.getName() + "_" + item.getLibGUID();
                });
            }
            // else
            // {
            //     item.parameters.forEach(p => {
            //         p.id = p.id + "_" + item.name;
            //         p.name = p.name + "_" + item.name;
            //         p.displayName = p.displayName + item.name;
            //     });
            // }

        });

    }

}


serialijse.declarePersistable(Expression);
serialijse.declarePersistable(ExpressionPoint);

serialijse.declarePersistable(GeometryEditor);
serialijse.declarePersistable(GeomPrimitiveObject);
serialijse.declarePersistable(GeomPrimitiveBox);
serialijse.declarePersistable(GeomPrimitiveCylinder);
serialijse.declarePersistable(GeomPrimitiveCone);
serialijse.declarePersistable(GeomPrimitiveSphere);
serialijse.declarePersistable(GeomPrimitiveTorus);

serialijse.declarePersistable(GeomOperationCut);
serialijse.declarePersistable(GeomOperationFuse);
serialijse.declarePersistable(GeomOperationCommon);

serialijse.declarePersistable(GeomTransfoRotate);
serialijse.declarePersistable(GeomTransfoTranslate);
serialijse.declarePersistable(GeomTransfoClone);

serialijse.declarePersistable(GeomTransfoBatch);
serialijse.declarePersistable(ShapeConnector);

GeometryEditor.serialize = serialijse.serialize;
GeometryEditor.deserialize = serialijse.deserialize;
GeometryEditor.serializeZ = serialijse.serializeZ;
GeometryEditor.deserializeZ = serialijse.deserializeZ;


function convertParameterToScript(param) {
    const value = (param.value === null || param.value === undefined) ? param.defaultValue : param.value;
    if (isNaN(value) && typeof value === "string"){
        return "var $" + param.id + " = '" + value + "';";
    }
    return "var $" + param.id + " = " + value + ";";
}
function evaluateExpression(expression, parameters) {
    if (!expression) return;
    assert(expression instanceof Expression);
    const str = "(function(){ " + parameters.map(convertParameterToScript).join("\n") + " return " + expression.exp + ";})()";
    try {
        const value = eval(str);
        return value;
    }
    catch (err) {
        console.log(str);
        throw err;
    }
}

function evaluateExpressionPoint(expression, parameters) {
    assert(expression instanceof ExpressionPoint);
    const str = "(function(){ " + parameters.map(convertParameterToScript).join("\n") +
        " return [" +
        expression.X.exp + "," +
        expression.Y.exp + "," +
        expression.Z.exp + "]; \n" +
        "})()";
    try {
        const value = eval(str);
        return value;
    }
    catch (err) {
        console.log(str);
        throw err;
    }
}

module.exports = {

    Expression: Expression,
    ExpressionPoint: ExpressionPoint,

    WidgetBase: WidgetBase,
    WidgetBaseConn: WidgetBaseConn,
    WidgetCollection: WidgetCollection,
    WidgetConnector: WidgetConnector,
    WidgetConnectorList: WidgetConnectorList,

    ShapeConnector: ShapeConnector,

    GeomBase: GeomBase,

    GeometryEditor: GeometryEditor,

    GeomPrimitiveObject: GeomPrimitiveObject,
    GeomPrimitiveBox: GeomPrimitiveBox,
    GeomPrimitiveCylinder: GeomPrimitiveCylinder,
    GeomPrimitiveCone: GeomPrimitiveCone,
    GeomPrimitiveSphere: GeomPrimitiveSphere,
    GeomPrimitiveTorus: GeomPrimitiveTorus,

    GeomOperationCut: GeomOperationCut,
    GeomOperationFuse: GeomOperationFuse,
    GeomOperationCommon: GeomOperationCommon,

    GeomTransfoRotate: GeomTransfoRotate,
    GeomTransfoTranslate: GeomTransfoTranslate,
    GeomTransfoClone: GeomTransfoClone,
    GeomTransfoBatch: GeomTransfoBatch,
    //...

    convertParameterToScript: convertParameterToScript,
    evaluateExpression: evaluateExpression,
    evaluateExpressionPoint: evaluateExpressionPoint,


    serialijse: serialijse,

};





