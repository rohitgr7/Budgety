/* It is s kind of class or module where weh have private and public members seperated. We rdefine the members as private within an object by not returning them and the public members are returned so that they can be accessed outside.
*/

/* All the below modules are completely independent to each other
*/



/*
// Here x and add are in closure even if they are in IIFE they can't be accessed outside.
var budgetController = (function() {
    //private
    x = 23;
    var add = function(a) {
        return x + a;
    }

    //public
    return {
        publicTest: function(b) {
            return add(b);
        };
    }

})();

var UIController = (function() {
    // Some code
})();

// The belw module knows about the other modules because we have passed them as arguments
var controller = (function(budgetCtrl , UICtrl) {

    // Some code

})(budgetController , UIController);
*/









// Budget controller
var budgetController = (function() {

    var Expense = function(id , description , value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = 0;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0)
            this.percentage = Math.round((this.value / totalIncome) * 100);
        else
            this.percentage = 0;
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income = function(id , description , value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(curr) {
            sum += curr.value;
        });
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
        percentage: 0
    };

    return {
        addItem: function(type , des , val) {
            var newItem , id;

            // Create a new id based on the type of the item and then push it into the data structure and return the newItem.
            id = 0;
            if (data.allItems[type].length > 0)
                id = data.allItems[type][data.allItems[type].length - 1].id + 1;

            if (type === "exp")
                newItem = new Expense(id , des , val);
            else if (type === "inc")
                newItem = new Income(id , des , val);
            //adding the newItem
            data.allItems[type].push(newItem);

            return newItem;
        },

        deleteItem: function(type  , id) {
            var ids , index;
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);
            if (index !== -1) {
                data.allItems[type].splice(index , 1);
            }
        },

        calculateBudget: function() {

            // Calculate total income and expenses
            calculateTotal("inc");
            calculateTotal("exp");


            // Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // Calculate the percentage of the income we spent
            if (data.totals.inc > 0)
                data.percentage = Math.round((data.totals.exp/data.totals.inc)*100);
            else 
                data.percentage = 0;

        },

        calculatePercentages: function() {
            data.allItems.exp.forEach(function(curr) {
                curr.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function() {
            var allPer = data.allItems.exp.map(function(curr) {
                return curr.getPercentage(); 
            });

            return allPer;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        }
    };

})();


//UI controller
var UIController = (function() {
    var DomStrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn",
        incomeContainor: ".income__list",
        expenseContainor: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expenseLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container",
        expensesPercLabel: ".item__percentage",
        dateLabel: ".budget__title--month"
    };

    var formatNumber = function(num , type) {
        var numSplit , int , dec , sign;

        if (num === 0)
            return 0.00;

        num = Math.abs(num);
        // fix the number to decimal numbers and converts it to a string
        num = num.toFixed(2);

        numSplit = num.split(".");
        int = numSplit[0];
        dec = numSplit[1];

        if (int.length > 3)
            int = int.substr(0 , int.length - 3) + "," + int.substr(int.length - 3 , 3);

        sign = (type === "exp") ? "-" : "+";

        return sign + " " + int + "." + dec;

    };

    var nodeListForEach = function(List , callBack) {
        for (var i = 0 ; i < List.length ; ++i)
            callBack(List[i] , i);
    };


    // Get the input method

    return  {
        getInput: function() {
            return { 
                type: document.querySelector(DomStrings.inputType).value, // willbe either inc or exp
                description: document.querySelector(DomStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DomStrings.inputValue).value)
            }; 
        },

        addListItem: function(obj , type) {
            var html , newHtml , element;
            
            // Create html string with placeholder tags
            if (type === "inc") {
                element = DomStrings.incomeContainor;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            else if (type === "exp") {
                element = DomStrings.expenseContainor;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace placeholders tag with actual data
            newHtml = html.replace("%id%" , obj.id);
            newHtml = newHtml.replace("%description%" , obj.description);
            newHtml = newHtml.replace("%value%" , formatNumber(obj.value , type));

            // Insert html into the DOM
            document.querySelector(element).insertAdjacentHTML("beforeend" , newHtml);

        },

        deleteListItem: function(selectorId) {
            // We cant't directly delete the part of html code using its id or class. We need to get its parent node and then delete the child  
            var el = document.getElementById(selectorId);
            el.parentNode.removeChild(el);
        },

        // clearing the fields after we have entered the input
        clearFields: function() {
            var fields;

            fields = document.querySelectorAll(DomStrings.inputDescription + ", " + DomStrings.inputValue);

            // here the above code returns the list not an array so we have to convert it to an array
            fields = Array.prototype.slice.call(fields);

            fields.forEach(function(current , index , array) {
                current.value = "";
            });

            // To bring the cursor back to the description
            fields[0].focus();
        },

        displayBudget: function(obj) {
            var type;
            type = (obj.budget > 0) ? "inc" : "exp";
            document.querySelector(DomStrings.budgetLabel).textContent = formatNumber(obj.budget , type);
            document.querySelector(DomStrings.incomeLabel).textContent = formatNumber(obj.totalInc , "inc");
            document.querySelector(DomStrings.expenseLabel).textContent = formatNumber(obj.totalExp , "exp");
            document.querySelector(DomStrings.percentageLabel).textContent = (obj.percentage > 0) ? (obj.percentage + "%") : "--";
        },


        displayPercentages: function(percentages) {
            // Selecing all the expenses nodes
            var fields = document.querySelectorAll(DomStrings.expensesPercLabel);
            
            nodeListForEach(fields , function(current , index) {
                if (percentages[index] > 0)
                    current.textContent = percentages[index] + "%";
                else
                    current.textContent = "--";
            });
        },

        displayMonth: function() {
            var now , year , month , months;
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            document.querySelector(DomStrings.dateLabel).textContent = months[month] + " " + year;

        },

        changedType: function() {
            var fields = document.querySelectorAll(DomStrings.inputType + "," + DomStrings.inputDescription + "," + DomStrings.inputValue);
            nodeListForEach(fields , function(curr) {
                curr.classList.toggle("red-focus");
            });
            
            document.querySelector(DomStrings.inputBtn).classList.toggle("red");

        },

        getDomStrings: function() {
            return DomStrings;
        }

    }
})();


//Global-app controller
var controller = (function(budgetCtrl , UICtrl) {

    var setupEventListners = function() {

        var DomStrings = UICtrl.getDomStrings();

        document.querySelector(DomStrings.inputBtn).addEventListener("click" , ctrlAddItem);

        // In case we hit enter after adding the values
        document.addEventListener("keypress" , function(event) {
            // key-code of enter is 13
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DomStrings.container).addEventListener("click" , ctrlDeleteItem);

        document.querySelector(DomStrings.inputType).addEventListener("change" , UICtrl.changedType);
    };

    var updateBudget = function() {

        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function() {

        // 1. Calculate the percentages
        budgetCtrl.calculatePercentages();

        // 2. read them from budget contorller
        var percentages = budgetCtrl.getPercentages();

        // 3. Update the UI with new percentages
        UICtrl.displayPercentages(percentages);

    }

    var ctrlAddItem = function() {

        var input , newItem;
        // 1. Get the field input data
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type , input.description , input.value);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem , input.type);

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Update percentages
            updatePercentages();
        }
    };

    var ctrlDeleteItem = function(event) {
        var itemID , splitID , type , ID;
        // We need to get the id of the part of te code which we want to delete
        //itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            // inc-1 or inc-2.....
            splitID = itemID.split("-"); //split inc or exp and the id
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. Delete the item from data structure
            budgetCtrl.deleteItem(type , ID);

            // 2.Delete the item from the UI
            UICtrl.deleteListItem(itemID);

            // 3. Update and show the new budget
            updateBudget();

            //4. Update percentages
            updatePercentages();
        }

    }

    return {
        init: function() {
            console.log("application has started");
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalExp: 0,
                totalInc: 0,
                percentage: 0
            });
            setupEventListners();
        }
    };

})(budgetController , UIController);

controller.init();



//2333DRV925K7E0B










