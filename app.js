//IIFE = Immediately Invoked Function Expression (wrap in parenthesis) - Allows data privacy bc of new scope

//BUDGET CONTROLLER
var budgetController = (function(){

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }  
    
    Expense.prototype.calcPercentage = function(total) {
        if(total > 0) {
            this.percentage = Math.round((this.value / total * 100));
        } else {
            this.percentage = -1;
        }
    }

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }  

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(current, index, array) {
            sum += current.value;
        })
        data.totals[type] = sum;
    }
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1 //doesnt exist until it does
    }

    return {
        addItem: function(type, des, val) {
            var newItem, ID;

            //create new ID
            if (data.allItems[type].length > 0){ 
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            //create new item based on 'inc' or 'exp' type
            // newItem = new type(ID, des, val);
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            //push into our data structure
            data.allItems[type].push(newItem);

            //return new element
            return newItem;
        },

        deleteItem: function(id, type) {
            var ids, index;
            ids = data.allItems[type].map(function(current){
                return current.id;
            })
            index = ids.indexOf(id);
            // indexTest = data.allItems[type].indexOf(id) - 1;
            // console.log('reg:' + index);
            // console.log('test:' + indexTest);
            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: function() {

            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income that we spend
            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function() {

            data.allItems.exp.forEach(function(current) {
                current.calcPercentage(data.totals.inc);
            })
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpenses: data.totals.exp,
                percentage: data.percentage
            }
        },

        getPercentages: function() {
            var allPercentages = data.allItems.exp.map(function(current) {
                return current.getPercentage();
            })
            return allPercentages;
        },

        testing: function() {
            console.log(data);
            console.log(data.allItems);
            console.log('exp' + data.allItems.exp + '   inc:' + data.allItems.inc);
        }
    }
})();
 

//UI CONTROLLER
var UIController = (function(){

    var DOMstrings = {
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
        expensesPercentage:'.item__percentage',
        dateLabel: '.budget__title--month'
    }

    var formatNumber = function(num, type) {
        var numSplit, int, dec;
        num = Math.abs(num); //takes absolute value (-5) = 5
        num = num.toFixed(2); //always adds 2 decimal places

        numSplit = num.split('.');
        int = numSplit[0];
        dec = numSplit[1];
        if(int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 2310, output 2,310
        }

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    }

    var nodeListForEach = function(list, callback) {
        for (var i=0; i < list.length; i++) {
            callback(list[i], i);
        }
    }

    return {
        getInput: function() {
            return {                
                type: document.querySelector(DOMstrings.inputType).value, // Will be values inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },

        addListItem: function(obj, type) {
            var html, newHtml;
            // Create HTML string with placeholder text

            if(type === 'inc')
            {
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%">' +                
                                            '<div class="item__description">%description%</div>' +
                                            '<div class="right clearfix">' +
                                                '<div class="item__value">%value%</div>' +
                                                '<div class="item__delete">' +
                                                    '<button class="item__delete--btn"><i ' + 'class="ion-ios-close-outline"></i></button>' +
                                                '</div>' +
                                            '</div>' + 
                                        '</div>'
            } 
            else if(type === 'exp')
            {
                element = DOMstrings.expensesContainer;
                html =  '<div class="item clearfix" id="exp-%id%">' +
                        '<div class="item__description">%description%</div>' +
                        '<div class="right clearfix">' +
                            '<div class="item__value">%value%</div>' +
                            '<div class="item__percentage">21%</div>' +
                            '<div class="item__delete">' +
                                '<button class="item__delete--btn"><i ' + 'class="ion-ios-close-outline"></i></button>' +
                            '</div>' +
                        '</div>' +
                    '</div>'
            }

            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert the HTLM into the DOM
            //selects income/expense__list and adds html "beforeend"
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorId) {
            var el;

            // document.getElementById(selectorId).parentNode.removeChild(document.getElementById(selectorId));
            el = document.getElementById(selectorId);
            el.parentNode.removeChild(el);


        },

        clearFields: function() {            
            var fields, fieldsArray;
            //could use regular querySelector but this is one line and one variable(returns list)
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

            //Convert to array
            fieldsArray = Array.prototype.slice.call(fields);

                                        //current value of element, index of array, actual array
            fieldsArray.forEach(function(current, index, array) {
                current.value = "";
            })

            fieldsArray[0].focus();
        },

        displayBudget: function(budgetObj) {
            var type;
            budgetObj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(budgetObj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(budgetObj.totalIncome, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(budgetObj.totalExpenses, 'exp');
            document.querySelector(DOMstrings.percentageLabel).textContent = budgetObj.percentage;

            

            if(budgetObj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = budgetObj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMstrings.expensesPercentage);

            nodeListForEach(fields, function(current, index) {
                if(percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
                

            })
        },

        displayDate: function() {
            var now, year, month, months;
            var now = new Date();
            // var christmas = new Date(2018, 11, 25)
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();

            document.querySelector(DOMstrings.dateLabel).textContent = months[month + 1] + ', ' + year;

        },

        changedType: function() {

            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            )

            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            })

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

        },

        getDOMstrings: function() {
            return DOMstrings;
        }
    }

})();

//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl){
    
    var setUpEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();
        
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
            if(event.key === "Enter" || event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    var updateBudget = function() {
        var budget;
        //Calculate the Budget
        budgetCtrl.calculateBudget();

        //Return the budget from budgetController
        budget = budgetCtrl.getBudget();

        //Display the budget on the UI in UIController
        UICtrl.displayBudget(budget);
    }

    var updatePercentages = function() {

        //Calculate percentages
        budgetCtrl.calculatePercentages();

        //Return percentages from budgetController
        var percentages = budgetCtrl.getPercentages();

        //Display the percentages on UI in UIController
        UICtrl.displayPercentages(percentages);
    }

    var ctrlAddItem = function() {
        var input, newItem;
        //1. Get the field input data
        input = UICtrl.getInput();
        console.log('input:' + input.description);
        
        //Prevents posting with invalid fields
        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
        //2. Add the item to the budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);

        //3. Add the item to the UI
        UICtrl.addListItem(newItem, input.type);

        //4. Clear the input fields and give focus back to first field
        UICtrl.clearFields();

        //5. Calculate and update budget
        updateBudget();

        //6. Calculate percentages
        updatePercentages();
        }

    };

    var ctrlDeleteItem = function(event) {
        debugger;
        var item, split, type, Id;
        //DOM traversing up from the i class to the button all the way up to the item id
        var item = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(item) { //make sure there's an id(its an inc or exp)
            split = item.split('-'); //['inc', 1]
            type = split[0]; //[inc]
            Id = parseInt(split[1]); //[1]
        }

        // 1. Delete item from data structure
        budgetCtrl.deleteItem(Id, type);

        // 2. Delete item from UI
        UICtrl.deleteListItem(item);

        // 3. Update and show new budget
        updateBudget();

        // 4. Calculate percentages
        updatePercentages();
    }

    return {
        init: function() {
            console.log('Application has started');
            UICtrl.displayDate();
            UICtrl.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpenses: 0,
                percentage: -1
            });
            
            setUpEventListeners();
        }
    };

})(budgetController, UIController);

controller.init();

