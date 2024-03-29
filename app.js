///// BUDGET CONTROLLER
var budgetController = (function() {
  // Expense Function Constructor
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome < 0) {
      this.percentage = Math.round(this.value / totalIncome) * 100;
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };
  // Income Function Constructor
  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(cur) {
      sum += cur.value;
    });
    data.totals[type] = sum;
  };

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
    percentage: -1
  };

  return {
    addItem: function(type, des, val) {
      var newItem, ID;
      // create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // create new item based on exp or inc type
      if (type === 'exp') {
        newItem = new Expense(ID, des, val);
      } else if (type === 'inc') {
        newItem = new Income(ID, des, val);
      }
      // push into data structure
      data.allItems[type].push(newItem);
      // return the new element
      return newItem;
    },

    deleteItem: function(type, id) {
      var ids, index;
      ids = data.allItems[type].map(function(item) {
        return item.id;
      });
      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculatebudget: function() {
      // calculate total income and expenses
      calculateTotal('exp');
      calculateTotal('inc');
      // calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      // calculate the percentage of income that we spend
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },
    calculatePercentages: function() {
      data.allItems.exp.forEach(function(cur) {
        cur.calcPercentage(data.totals.inc);
      });
    },
    getPercentage: function() {
      var allPerc = data.allItems.exp.map(function(cur) {
        return cur.getPercentage();
      });
      return allPerc;
    },
    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    },
    testing: function() {
      console.log(data);
    }
  };
})();

///// UI CONTROLLER
var UIController = (function() {
  // some code

  var DOMStrings = {
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
    dateLabel: '.budget__title--month'
  };

  var nodeListForEach = function(list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMStrings.inputType).value, // either inc or exp
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
      };
    },
    addListItem: function(obj, type) {
      // create HTML string with placeholder text
      let html, newHtml, element;
      if (type === 'inc') {
        element = DOMStrings.incomeContainer;
        html = `
        <div class="item clearfix" id="inc-%id%">
            <div class="item__description">%description%</div>
            <div class="right clearfix">
            <div class="item__value">+ %value%</div>
            <div class="item__delete">
                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
            </div>
            </div>
        </div>`;
      } else if (type === 'exp') {
        element = DOMStrings.expensesContainer;
        html = `<div class="item clearfix" id="exp-%id%">
            <div class="item__description">%description%</div>
            <div class="right clearfix">
                <div class="item__value">%value%</div>
                <div class="item__percentage">21%</div>
                <div class="item__delete">
                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                </div>
            </div>
        </div>`;
      }
      // replace placeholder text with actual data
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', obj.value);
      // insert HTML into DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    deleteListItem: function(selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearFields: function() {
      var fields = document.querySelectorAll(
        DOMStrings.inputDescription + ',' + DOMStrings.inputValue
      );
      var fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach(input => {
        input.value = '';
      });

      fieldsArr[0].focus();
    },
    displayBudget: function(obj) {
      document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
      document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalInc;
      document.querySelector(DOMStrings.expensesLabel).textContent =
        obj.totalExp;

      if (obj.percentage > 0) {
        document.querySelector(DOMStrings.percentageLabel).textContent =
          obj.percentage;
      } else {
        document.querySelector(DOMStrings.percentageLabel).textContent = '---';
      }
    },
    displayMonth: function() {
      var now, months, year, month;
      now = new Date();
      months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ];
      month = now.getMonth();

      year = now.getFullYear();
      document.querySelector(DOMStrings.dateLabel).textContent =
        months[month] + ' ' + year;
    },
    changedType: function() {
      var fields = document.querySelectorAll(
        DOMStrings.inputType +
          ',' +
          DOMStrings.inputDescription +
          ',' +
          DOMStrings.inputValue
      );
      nodeListForEach(fields, function(cur) {
        cur.classList.toggle('red-focus');
      });
      document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
    },
    getDOMStrings: function() {
      return DOMStrings;
    }
  };
})();

///// global app CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {
  var setupEventListeners = function() {
    var DOM = UICtrl.getDOMStrings();
    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    document.addEventListener('keypress', function(e) {
      if (e.keyCode === 13) {
        ctrlAddItem();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener('click', ctrlDeleteItem);

    document
      .querySelector(DOM.inputType)
      .addEventListener('change', UICtrl.changedType);
  };

  var updateBudget = function() {
    // 1. calculate the budget
    budgetCtrl.calculatebudget();
    // 2. return the budget
    var budget = budgetCtrl.getBudget();
    // 3. display the budget
    UICtrl.displayBudget(budget);
  };

  var updatePercentages = function() {
    // 1. calculate the percentages
    budgetCtrl.calculatePercentages();
    // 2. read from percentages from the budget controller
    var percentages = budgetCtrl.getPercentage();
    // 3. update the UI with the new percentages
    console.log(percentages);
  };

  var ctrlAddItem = function() {
    var input, newItem;

    // 1. get field input data
    input = UICtrl.getInput();

    if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
      // 2. add item to budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      // 3. add the new item to UI
      UICtrl.addListItem(newItem, input.type);
      UICtrl.clearFields();
      // 5. calculate and update budget
      updateBudget();
      // 6. calculate and update percentages
      updatePercentages();
    } else {
      alert('enter all values');
    }
  };

  var ctrlDeleteItem = function(event) {
    if (event.target.classList.contains('ion-ios-close-outline')) {
      var itemID, splitID, type, ID;
      itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

      if (itemID) {
        //inc-1
        splitID = itemID.split('-');
        type = splitID[0];
        ID = parseInt(splitID[1]);

        // 1. delete item from Data structure
        budgetController.deleteItem(type, ID);
        // 2. delete item from UI
        UICtrl.deleteListItem(itemID);
        // 3. update and show the new budget
        updateBudget();
        // 4. calculate and update percentages
        updatePercentages();
      }
    }
  };

  return {
    init: function() {
      console.log('app has started');
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      setupEventListeners();
    }
  };
})(budgetController, UIController);

controller.init();
