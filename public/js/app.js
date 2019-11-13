/*
*   BUDGET CONTROLLER MODULE
*   IEFE (Imediatlt Envoced Funcion Expression)
*   Provides privacy by creating a new scope, not
*   visible from the outside scope.
*/

// Module returns all of the functions that need
// to be public to the outside scope.

// Controls budget operations
let budgetController = (function() {

    // Declaring function constructors (classes)
    let Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    // Expences method
    Expense.prototype.calcPercentages = function(totalIncome) {
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    // Getter
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    let Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    let calculateTotal = function(type) {
        let sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;
    }

    // Object to hold all data
    let data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    // Public addItem method
    return {
        addItem: function(type, des, val) {
            let newItem, ID;

            // Create new ID (1 more than the last)
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            // Create new item, based on the type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if(type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            // Pushing the new Expense/Income Object to the 
            // relevant object array
            data.allItems[type].push(newItem);

            // Return the new Element
            return newItem;
        },

        deleteItem: function(type, id) {
            let ids, index;

            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function() {
            
            // Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            // Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // Calcuate the percentage of income the we spent
            if(data.totals.inc > 0) {
            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            // Expense = 100 and income 300, spent 33.333% = 100/300 = 0.3333 * 100
            } else {
                data.percentage = -1;
            }
        },

        // Calculates percentages for every item in the exp data structure
        calculatePercentages: function() {
            
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentages(data.totals.inc);
            });
        },

        getPercentages: function() {
            // Using map because it returns a variable
            let allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            // array of all the % for every item in data.exp array
            return allPerc;
        },

        getBudget: function() {
            // Using object to return multiple values
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        // JUST FOR TESTING!!!
        testing: function() {
            console.log(data);
        }
    };

})();

// Controls interaction with the UI
let UIController = (function() {

    // Object to hold all of the DOM stings
    let DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }

    let formatNumber = function(num, type) {
        let numSplit, int, dec;
        /*
        + or - before number
        exactly 2 decimal points
        coma separating the thousands
        e.g.
        2310.4567 -> + 2,310.46
        */

        // storing the absolute number
        num = Math.abs(num);
        // Always append 2 decimal points
        num = num.toFixed(2);
        // split the outputted string
        numSplit = num.split('.');

        int = numSplit[0];
        if(int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];

        // type === 'exp' ? sign = '-' : sign = '+';

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    let nodeListForEach = function(list, callback) {
        for (let i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function() {
            // Returning an object with three properties
            return {
                // Collection the values from the page
                // Defining object properties
                type: document.querySelector(DOMstrings.inputType).value, // Will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function (obj, type) {
            let html, newHtml, element;
            // Create HTML string with placeholder text
            if(type === 'inc') {
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            } else if(type === 'exp') {
                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            }
            
            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selecterID) {
            let el = document.getElementById(selecterID);
            el.parentNode.removeChild(el);
        },

        clearFields: function() {
            let fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' +
            DOMstrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });

            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {
            // Applies the values stores in the getBudget object.
            let type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if(obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '--';
            }
        },

        displayPercentages: function(percentages) {
            // Grab all instances of the percentage label
            let fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields, function(current, index) {
                
                if(percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '--';
                }
            });
        },

        displayMonth: function() {
            let now, month, year, months;
            now = new Date();

            year = now.getFullYear();

            months = ['January', 'Febuary', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];

            month = months[now.getMonth()];
            console.log(month);
            document.querySelector(DOMstrings.dateLabel).textContent = month + ' ' + year;
        },

        changedType: function() {

            fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);

            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        getDOMstrings: function() {
            // Releasing private object to the public scope
            return DOMstrings;
        }
    };

})();

// GLOBAL APP CONTROLLER
// Interface between the budget and UI
let controller = (function(budgetCtrl, UICtrl) {
    // Init function
    let setupEventListeners = function() {
        // Accessing the public DOMstrings.
        let DOM = UICtrl.getDOMstrings();

        // Callback for ctrlAddItem
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        // Enter button is pressed
        document.addEventListener('keypress', function(event) {
            if(event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType)
    };

    let updateBudget = function() {
        
        // 1. Calcuate the budget
        budgetCtrl.calculateBudget();
        // 2. Return the budget
        let budget = budgetCtrl.getBudget();
        // 3. Display the budget on the UI
        console.log(budget);
        UICtrl.displayBudget(budget);
    };

    let updatePercentages = function() {

        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();
        // 2. Read precentages from the budget controller
        let percentages = budgetCtrl.getPercentages();
        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };

    // CUSTOM FUNCTIONS
    let ctrlAddItem = function() {
        let input, newItem;
        /*
        *   What happens whaen the button is pressed?
        */
        //   1. Get the field input data
        input = UICtrl.getInput();
        console.log(input);

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //   2. Add the item to the budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        //   3. Add the item to the UI
        UICtrl.addListItem(newItem, input.type);
        //   4. Clear all fields
        UICtrl.clearFields();
        //   5. Calculate and updata budgetq
        updateBudget();
        //  6. Calculate and update percentages
        updatePercentages();
        }    
    };

    let ctrlDeleteItem = function(event) {
        let itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID) {
            // itemID = inc-x
            splitID = itemID.split('-');    // ['inc', 'x']
            type = splitID[0];              // 'inc'
            ID = parseInt(splitID[1]);                // x

            // 1. Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);
            // 3. Update and show the new budget
            updateBudget();
            // 4. Calculate and update percentages
    
        }
        
    };
    
    // Public init function
    return {
        init: function() {
            console.log('Application has started.');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
         
        }
    }
})(budgetController, UIController);

// Calling the public init function
controller.init();