import { API_URL } from "../../settings.js";
//const API_URL = "http://localhost:8080/api/"
let tokenFromBackEnd;

export async function initLogin() {
  document.getElementById("login-btn").onclick = login;

  document.getElementById("login-message").innerText = "";

  const usernameInput = document.getElementById("username-input");
  const passwordInput = document.getElementById("password-input");

  // Bootstrap kode til login-alert
  // ref: https://getbootstrap.com/docs/5.3/components/alerts/
  const alertPlaceholder = document.getElementById(
    "live-login-message-placeholder"
  );
  const appendAlert = (message, type) => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = [
      `<div class="alert alert-${type} alert-dismissible" role="alert">`,
      `   <div>${message}</div>`,
      '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
      "</div>",
    ].join("");

    alertPlaceholder.append(wrapper);
  };

  async function loginMessageSuccesful() {
    appendAlert(
      "You logged successfully in to " + localStorage.getItem("user"), "success"
    );
  }

  async function loginMessageUnsuccesful() {
    appendAlert("You have entered the wrong password or username!", "danger");
  }

  async function alreadyLoggedIn() {
    appendAlert(
      "You are already logged in as " + localStorage.getItem("user"),
      "success"
    );
  }


  async function handleHttpErrors(res) {
    if (!res.ok) {
      const errorResponse = await res.json();
      const error = new Error(errorResponse.message);
      // @ts-ignore
      error.apiError = errorResponse;
      throw error;
    }
    return res.json();
  }

  async function login(evt) {
    evt.preventDefault();
    evt.stopPropagation();

    const loginRequest = {};
    // @ts-ignore
    loginRequest.username = usernameInput.value;
    // @ts-ignore
    loginRequest.password = passwordInput.value;

    const options = {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify(loginRequest),
    };

    if (isUserLoggedIn) {

        alreadyLoggedIn();

    try {
      const response = await fetch(API_URL + "/auth/login", options).then(
        handleHttpErrors
      );
      storeLoginDetails(response);

    if (localStorage.getItem("token") === response.token) {

      // @ts-ignore
      usernameInput.value = "";
      // @ts-ignore
      passwordInput.value = "";

      loginMessageSuccesful();

    } else if (localStorage.getItem("token") !== response.token){

      loginMessageUnsuccesful();

    }

    } catch (error) {
      console.log(error);
    }

    }




    // TODO hvis man prøver at logge ind men allerede er logget ind


  }

  /**
   * Store username, roles and token in localStorage, and update UI-status
   * @param res - Response object with details provided by server for a succesful login
   */
  function storeLoginDetails(res) {
    localStorage.setItem("token", res.token);
    localStorage.setItem("user", res.username);
    localStorage.setItem("roles", res.roles);
    tokenFromBackEnd = res.token;
    toggleUiBasedOnRoles(true);
  }
}
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("roles");
  tokenFromBackEnd = "";
  toggleUiBasedOnRoles(false);
}

export function toggleUiBasedOnRoles(loggedIn) {
  const loginContainer = document.getElementById("login-container");
  const logoutContainer = document.getElementById("logout-container");

  const mealplanContainer = document.getElementById("mealplan-container");
  const userSettingsContainer = document.getElementById(
    "userSettings-container"
  );

  // console.log("Roles: ", roles)
  console.log("Local token: ", localStorage.getItem("token"));
  console.log("Token from backend:", tokenFromBackEnd);

  // Visibility
  logoutContainer.style.display = "block";
  loginContainer.style.display = "none";
  mealplanContainer.style.display = "none";

  if (loggedIn) {
    logoutContainer.style.display = "block";
    loginContainer.style.display = "none";

    // Element til at vise username ved siden af (logout)
    document.getElementById("logout-username").innerText =
      localStorage.getItem("user");

    mealplanContainer.style.display = "block";
    userSettingsContainer.style.display = "block";

  } else {
    logoutContainer.style.display = "none";
    loginContainer.style.display = "block";
    mealplanContainer.style.display = "none";
    userSettingsContainer.style.display = "none";
  }
}

export function isUserLoggedIn() {
  return localStorage.getItem("token") == tokenFromBackEnd && tokenFromBackEnd !== null;
}
