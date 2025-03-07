let element = document.body;
let mode = localStorage.getItem("mode");
if (localStorage.getItem("mode") != "light" && localStorage.getItem("mode") != "dark") {
  localStorage.setItem("mode", "light");
}
mode = localStorage.getItem("mode");
if (mode == "light") {
  document.getElementById("mode_button").innerHTML = 
  '<i class="material-icons">light_mode</i>Light Mode'
  if (element.classList.value == "dark_mode") {
    element.classList.remove("dark_mode");
  }
} else if (mode == "dark") {
  document.getElementById("mode_button").innerHTML = 
  '<i class="material-icons">dark_mode</i>Dark Mode'
  if (element.classList.value == "") {
    element.classList.add("dark_mode");
  }
} else if (mode == null) {
  document.getElementById("mode_button").innerHTML = 
  '<i class="material-icons">light_mode</i>Light Mode'
  localStorage.setItem("mode", "light");
}
function toggle_func() {
  let mode = localStorage.getItem("mode");
  let element = document.body;
  if (mode == "dark") {
    document.getElementById("mode_button").innerHTML = 
    '<i class="material-icons">light_mode</i>Light Mode'
    if (element.classList.value == "dark_mode") {
      element.classList.remove("dark_mode");
    }
    localStorage.setItem("mode", "light");
  } else if (mode == "light"){
    document.getElementById("mode_button").innerHTML = 
    '<i class="material-icons">dark_mode</i>Dark Mode'
    if (element.classList.value == "") {
      element.classList.add("dark_mode");
    }
    localStorage.setItem("mode", "dark");
  }
}