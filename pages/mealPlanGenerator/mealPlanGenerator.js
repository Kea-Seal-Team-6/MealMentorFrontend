import { API_URL } from "../../settings.js";
import {
  sanitizeStringWithTableRows,
  handleHttpErrors,
  makeOptions,
} from "../../utils.js";

const SERVER_URL = API_URL + "/mealPlanGenerator";
let myJsonObject; // Declare myJsonObject at a higher scope

export async function initMealPlanGenerator() {
  document
    .getElementById("submit-button")
    .addEventListener("click", async function (event) {
      event.preventDefault(); // Prevent the default form submission

      // Show the 'Please wait...' button and hide the 'SUBMIT' button
      document.getElementById("wait-button").style.display = "block";
      document.getElementById("submit-button").style.display = "none";

      // preferences
      let preferences = [];
      const preferenceContainer = document.getElementById("input-container");
      const preferencesInputs =
        preferenceContainer.querySelectorAll('input[type="text"]');
      preferencesInputs.forEach((p) => {
        if (p.value.trim().length > 0) {
          preferences.push(p.value);
        }
      });

      // meal checklist
      const mealChecklistDiv = document.getElementById("mealChecklistDiv");
      let mealChecklist = [];
      const checkboxesList = mealChecklistDiv.querySelectorAll(
        'input[type="checkbox"]'
      );
      checkboxesList.forEach((mealType) => {
        if (mealType.checked) {
          mealChecklist.push(mealType.value);
        }
      });

      const username = localStorage.getItem("user");
      console.log(username);

      // Combining all values to create JSON
      const fullUserInput = {
        username,
        mealChecklist,
        preferences,
      };

      const response = await fetch(
        SERVER_URL,
        makeOptions("POST", fullUserInput, true)
      );

      if (response.ok) {
        const responseData = await response.json();

        var jsonString = responseData.answer;
        myJsonObject = JSON.parse(jsonString);
        document.getElementById("jsonTable").innerHTML =
          createTable(myJsonObject);

        if (myJsonObject.hasOwnProperty('Breakfast')) {
          console.log(myJsonObject['Breakfast']);
        }

        // Add the "Save Recipe" buttons after creating the table
        addSaveRecipeButtons();

        document.getElementById("wait-button").style.display = "none";
        document.getElementById("submit-button").style.display = "block";
        return responseData;
      } else {
        document.getElementById("wait-button").style.display = "none";
        document.getElementById("submit-button").style.display = "block";
        const errorData = await response.json();

        document.getElementById("result").innerText = "* ERROR *";

        throw new Error(errorData.message);
      }
    });

  function addPreference(event) {
    if (event.target.value.length === 1) {
      const inputContainer = document.getElementById("input-container");
      const newInput = document.createElement("input");
      newInput.type = "text";
      newInput.placeholder = "Enter a preference/allergy";
      inputContainer.appendChild(newInput);
      newInput.addEventListener("input", addPreference);
    }
  }

  function createTable(JSONObject) {
    var tables = ""; // Variable to store all tables

    for (var key in JSONObject) {
      if (JSONObject.hasOwnProperty(key)) {
        var value = JSONObject[key];

        // Create a new table for each recipe
        var table = "<table border='1'>";
        table += "<tr><td colspan='2'><b>" + key + "</b></td></tr>";

        if (Array.isArray(value)) {
          // Handle array elements by concatenating them into a single cell
          table +=
            "<tr><td colspan='2'>" + value.join(', ') + "</td></tr>";
        } else if (typeof value === "object" && value !== null) {
          // Create rows for each detail within the same table
          for (var detailKey in value) {
            if (value.hasOwnProperty(detailKey)) {
              var detailValue = value[detailKey];
              table +=
                "<tr><td>" + detailKey + "</td><td>" + detailValue + "</td></tr>";
            }
          }
        } else {
          // Handle normal elements
          table += "<tr><td colspan='2'>" + value + "</td></tr>";
        }

        table += "</table>";

        tables += table;
      }
    }

    return tables;
  }

  function addSaveRecipeButtons() {
    // Add the "Save Recipe" button to each recipe
    const recipeTables = document.querySelectorAll("#jsonTable table");
    recipeTables.forEach((table) => {
      const mealType = table.querySelector("td b").textContent;
      const saveButton = document.createElement("button");
      saveButton.textContent = "Save Recipe";
      saveButton.setAttribute("data-meal-type", mealType);
      saveButton.addEventListener("click", saveRecipe);
      table.querySelector("td").appendChild(saveButton);
    });
  }
}

// Move saveRecipe outside of initMealPlanGenerator
function saveRecipe(event) {
  const mealType = event.target.getAttribute("data-meal-type");
  const recipeData = myJsonObject[mealType];
  const saveRecipeURL = API_URL + "/meals/save"; // Replace with your actual API URL

  fetch(saveRecipeURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(recipeData),
  })
    .then((response) => response.json())
    .then((data) => {
      alert("Recipe saved successfully!");
    })
    .catch((error) => {
      console.error("Error saving recipe:", error);
      alert("Failed to save recipe. Please try again.");
    });
}
