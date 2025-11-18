document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "http://localhost:3000/api";

  const loginView = document.getElementById("login-view");
  const registerView = document.getElementById("register-view");
  const appView = document.getElementById("app-view");
  const allViews = [loginView, registerView, appView];

  const loginForm = document.getElementById("login-form");
  const registerDoadorForm = document.getElementById("register-doador-form");
  const registerReceptorForm = document.getElementById(
    "register-receptor-form"
  );
  const createDoacaoForm = document.getElementById("create-doacao-form");

  const showRegisterLink = document.getElementById("show-register");
  const showLoginLink = document.getElementById("show-login");

  const tabLinks = document.querySelectorAll(".tab-link");
  const tabContents = document.querySelectorAll(".tab-content");

  const welcomeMessage = document.getElementById("welcome-message");
  const logoutButton = document.getElementById("logout-button");
  const doadorDashboard = document.getElementById("doador-dashboard");
  const receptorDashboard = document.getElementById("receptor-dashboard");
  const doacoesList = document.getElementById("doacoes-list");

  const errorMessage = document.getElementById("error-message");
  const successMessage = document.getElementById("success-message");

  function showView(viewToShow) {
    allViews.forEach((view) => view.classList.remove("active"));
    viewToShow.classList.add("active");
  }

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
    setTimeout(() => {
      errorMessage.style.display = "none";
    }, 3000);
  }

  function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.style.display = "block";
    setTimeout(() => {
      successMessage.style.display = "none";
    }, 3000);
  }

  function saveToken(token) {
    localStorage.setItem("authToken", token);
  }

  function getToken() {
    return localStorage.getItem("authToken");
  }

  function decodeToken(token) {
    try {
      const payload = token.split(".")[1];
      const decodedPayload = atob(payload);
      return JSON.parse(decodedPayload);
    } catch (e) {
      console.error("Erro ao decodificar token:", e);
      return null;
    }
  }

  showRegisterLink.addEventListener("click", (e) => {
    e.preventDefault();
    showView(registerView);
  });

  showLoginLink.addEventListener("click", (e) => {
    e.preventDefault();
    showView(loginView);
  });

  tabLinks.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetTab = tab.dataset.tab;

      tabLinks.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      tabContents.forEach((content) => {
        if (content.dataset.tabContent === targetTab) {
          content.classList.add("active");
        } else {
          content.classList.remove("active");
        }
      });
    });
  });

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const senha = document.getElementById("login-senha").value;

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(errorData || "Erro ao fazer login");
      }

      const data = await res.json();
      saveToken(data.token);
      initializeApp();
    } catch (err) {
      showError(err.message);
    }
  });

  registerDoadorForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = {
      nomeDoEstabelecimento: document.getElementById("doador-nome").value,
      email: document.getElementById("doador-email").value,
      senha: document.getElementById("doador-senha").value,
      cnpj: document.getElementById("doador-cnpj").value,
      localizacao: document.getElementById("doador-localizacao").value,
    };

    try {
      const res = await fetch(`${API_URL}/auth/register/doador`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error(await res.text());

      showSuccess("Doador cadastrado! Faça o login.");
      showView(loginView);
      loginForm.reset();
      registerDoadorForm.reset();
    } catch (err) {
      showError(err.message);
    }
  });

  registerReceptorForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = {
      nomeDaOrganizacao: document.getElementById("receptor-nome").value,
      email: document.getElementById("receptor-email").value,
      senha: document.getElementById("receptor-senha").value,
      cnpj: document.getElementById("receptor-cnpj").value,
      localizacao: document.getElementById("receptor-localizacao").value,
    };

    try {
      const res = await fetch(`${API_URL}/auth/register/receptor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error(await res.text());

      showSuccess("Receptor cadastrado! Faça o login.");
      showView(loginView);
      loginForm.reset();
      registerReceptorForm.reset();
    } catch (err) {
      showError(err.message);
    }
  });

  logoutButton.addEventListener("click", () => {
    localStorage.removeItem("authToken");
    showView(loginView);
    loginForm.reset();
  });

  function initializeApp() {
    const token = getToken();
    if (!token) {
      showView(loginView);
      return;
    }

    const user = decodeToken(token);
    if (!user) {
      localStorage.removeItem("authToken");
      showView(loginView);
      return;
    }

    showView(appView);
    welcomeMessage.textContent = `Bem-vindo(a), ${user.role.toLowerCase()}!`;

    if (user.role === "DOADOR") {
      doadorDashboard.style.display = "block";
      receptorDashboard.style.display = "none";
    } else if (user.role === "RECEPTOR") {
      doadorDashboard.style.display = "none";
      receptorDashboard.style.display = "block";
      fetchMatchingDoacoes();
    }
  }

  createDoacaoForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = {
      titulo: document.getElementById("doacao-titulo").value,
      descricao: document.getElementById("doacao-descricao").value,
      localizacaoRetirada: document.getElementById("doacao-localizacao").value,
    };

    try {
      const res = await fetch(`${API_URL}/doacoes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error(await res.text());

      showSuccess("Doação criada com sucesso!");
      createDoacaoForm.reset();
    } catch (err) {
      showError(err.message);
    }
  });

  async function fetchMatchingDoacoes() {
    try {
      const res = await fetch(`${API_URL}/doacoes/match`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (!res.ok) throw new Error(await res.text());

      const doacoes = await res.json();
      renderDoacoes(doacoes);
    } catch (err) {
      showError(err.message);
    }
  }

  function renderDoacoes(doacoes) {
    doacoesList.innerHTML = "";

    if (doacoes.length === 0) {
      doacoesList.innerHTML =
        "<p>Nenhuma doação encontrada para sua localização no momento.</p>";
      return;
    }

    doacoes.forEach((doacao) => {
      const card = document.createElement("div");
      card.className = "doacao-card";
      card.innerHTML = `
                <h4>${doacao.titulo}</h4>
                <p>${doacao.descricao}</p>
                <small>Doador: ${doacao.doador.nomeDoEstabelecimento}</small>
                <br>
                <small>Status: ${doacao.status}</small>
                <button data-id="${doacao._id}">Reservar</button>
            `;

      card.querySelector("button").addEventListener("click", () => {
        reservarDoacao(doacao._id);
      });

      doacoesList.appendChild(card);
    });
  }

  async function reservarDoacao(doacaoId) {
    try {
      const res = await fetch(`${API_URL}/doacoes/${doacaoId}/reservar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (!res.ok) throw new Error(await res.text());

      showSuccess("Doação reservada com sucesso!");
      fetchMatchingDoacoes();
    } catch (err) {
      showError(err.message);
    }
  }

  initializeApp();
});
