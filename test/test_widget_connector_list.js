const WidgetBase = require("../lib/widget_base").WidgetBase;
const WidgetCollection = require("../lib/widget_collection").WidgetCollection;
const WidgetConnector = require("../lib/widget_connector").WidgetConnector;
const should = require("should");

const WidgetBaseConn = require("../lib/widget_connector_list").WidgetBaseConn;

const assert = require("assert");

const WidgetConnectorList = require("../lib/widget_connector_list").WidgetConnectorList;


class Ingredient extends WidgetBase {

}

class IngredientConnector extends WidgetConnector {
    getWidgetClass() {
        return Ingredient;
    }
}


class IngredientDose extends WidgetBaseConn {
    constructor(parent) {
        super(parent);
        this.ingredientLink = new IngredientConnector(this);
        this.quantity = 1;
    }
}

class IngredientDoseList extends WidgetConnectorList {
    constructor(parent) {
        super(parent);
    }

    getWidgetClass() {
        return IngredientDose;
    }
}

class Recipe extends WidgetBase {
    constructor(name) {
        super(name);
        this.recipeItems = new IngredientDoseList(this);
    }

    addIngredientDose() {
        return this.recipeItems.addNewItem();
    }

    removeIngredientDose(item) {
        return this.recipeItems.removeItem(item);
    }

    getIngredientDose(index) {
        if (!(index >= 0 && index < this.recipeItems.length)) {
            throw new Error("invalid index specified");
        }
        return this.recipeItems[index];
    }

    clone() {
        const clone = new Recipe();
        // to do ...
        return clone;
    }
}


class MyRecipeCollection extends WidgetCollection {

    addRecipe(name) {
        return this._registerWidget(new Recipe(name));
    }

    addIngredient(name) {
        return this._registerWidget(new Ingredient(name));
    }

    getWidgetBaseClass() {
        return WidgetBase;
    }
}

describe("WidgetCollectionList", function () {


    it("should create a widget collection", function () {

        const wc = new MyRecipeCollection();

        const ingredient1 = wc.addIngredient("Mustard");
        const ingredient2 = wc.addIngredient("Carrot");
        const ingredient3 = wc.addIngredient("Cream");
        const ingredient4 = wc.addIngredient("Raspberries");
        const ingredient5 = wc.addIngredient("Rabbit");

        const recipe = wc.addRecipe("Rabbit à la Mustard");

        recipe.getWidgetConnectors().length.should.eql(0);

        ingredient1.getDependantEntities().length.should.eql(0);
        ingredient2.getDependantEntities().length.should.eql(0);
        ingredient3.getDependantEntities().length.should.eql(0);
        ingredient4.getDependantEntities().length.should.eql(0);
        ingredient5.getDependantEntities().length.should.eql(0);

        // the widget
        const dose1 = recipe.addIngredientDose();
        recipe.getWidgetConnectors().length.should.eql(1);

        dose1.ingredientLink.set(ingredient1);
        dose1.quantity = 42;


        const dose2 = recipe.addIngredientDose();
        recipe.getWidgetConnectors().length.should.eql(2);

        dose2.ingredientLink.set(ingredient2);
        dose2.quantity = 1;

        const dose3 = recipe.addIngredientDose();
        recipe.getWidgetConnectors().length.should.eql(3);

        dose3.ingredientLink.set(ingredient3);
        dose3.quantity = 32;

        ingredient1.getDependantEntities().length.should.eql(1);
        ingredient2.getDependantEntities().length.should.eql(1);
        ingredient3.getDependantEntities().length.should.eql(1);
        ingredient4.getDependantEntities().length.should.eql(0);
        ingredient5.getDependantEntities().length.should.eql(0);


        // our recipe has 3 doses items
        recipe.recipeItems.items.length.should.eql(3);

        // ---------------- We should be able to remove dose from the recipe
        recipe.removeIngredientDose(dose1);

        recipe.recipeItems.items.length.should.eql(2);

        ingredient1.getDependantEntities().length.should.eql(0, "ingredient1 should not be referenced anymore");
        ingredient2.getDependantEntities().length.should.eql(1);
        ingredient3.getDependantEntities().length.should.eql(1);
        ingredient4.getDependantEntities().length.should.eql(0);
        ingredient5.getDependantEntities().length.should.eql(0);

    });

    it("should unlink the ingredient in my recipe when I delete an ingredient", function () {

        const wc = new MyRecipeCollection();

        const ingredient1 = wc.addIngredient("Mustard");
        const ingredient2 = wc.addIngredient("Rabbit");
        const ingredient3 = wc.addIngredient("Cream");

        const recipe = wc.addRecipe("Rabbit à la Mustard");

        // the recipe
        const dose1 = recipe.addIngredientDose();
        dose1.ingredientLink.set(ingredient1);
        dose1.quantity = 42;

        recipe.recipeItems.items.length.should.be.eql(1);

        const dose2 = recipe.addIngredientDose();
        dose2.ingredientLink.set(ingredient2);
        dose2.quantity = 1;

        recipe.recipeItems.items.length.should.be.eql(2);

        // NOW I decide to change the recipe (remove an ingredient)!
        recipe.recipeItems.removeItem(dose2);

        // THEN the list of widgetConnectors in my recipe should be refreshed
        // AND should not contain my ingredient2
        recipe.getWidgetConnectors().length.should.be.eql(1);

    });

    it("should unlink the ingredient in my recipe when I delete an ingredient", function () {

        const wc = new MyRecipeCollection();

        const ingredient1 = wc.addIngredient("Mustard");
        const ingredient2 = wc.addIngredient("Rabbit");
        const ingredient3 = wc.addIngredient("Cream");
        const ingredient4 = wc.addIngredient("Aceite");

        const recipe = wc.addRecipe("Rabbit à la Mustard 'revisité'");

        // the recipe
        const dose1 = recipe.addIngredientDose();
        dose1.ingredientLink.set(ingredient1);
        dose1.quantity = 42;

        recipe.recipeItems.items.length.should.be.eql(1);

        const dose2 = recipe.addIngredientDose();
        dose2.ingredientLink.set(ingredient2);
        dose2.quantity = 1;

        recipe.recipeItems.items.length.should.be.eql(2);

        const dose3 = recipe.addIngredientDose();
        dose3.ingredientLink.set(ingredient3);
        dose3.quantity = 32;

        recipe.recipeItems.items.length.should.be.eql(3);

        // NOW I decide to change the recipe (remove an ingredient)!
        recipe.recipeItems.removeItem(dose3);

        // THEN the list of widgetConnectors in my recipe should be refreshed
        // AND should not contain my ingredient3 (Cream => it was too fat! Let's try Spanish Aceite)
        recipe.getWidgetConnectors().length.should.be.eql(2);

        const dose4 = recipe.addIngredientDose();
        dose4.ingredientLink.set(ingredient4);
        dose4.quantity = 32;

        recipe.recipeItems.items.length.should.be.eql(3);

    });




});
