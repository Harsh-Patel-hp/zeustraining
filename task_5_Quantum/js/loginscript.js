function togglePassword() {
  let password = document.getElementById("password");
  if (password.type === "password") {
    password.type = "text";
  } else {
    password.type = "password";
  }
}

let loginbtn = document
  .getElementById("login-button")
  .addEventListener("click", () => {
    window.location.href = "./teacher_dashbord.html";
  });
