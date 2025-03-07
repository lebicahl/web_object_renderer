let element = document.getElementById("layer_cover");
let mode = localStorage.getItem("mode");
if (localStorage.getItem("mode") != "light" && localStorage.getItem("mode") != "dark") {
  localStorage.setItem("mode", "light");
}
mode = localStorage.getItem("mode");
if (mode == "light") {
  document.getElementById("mode_button").innerHTML = '<i class="material-icons">light_mode</i>Light Mode'
  if (element.classList.value == "") {
    element.classList.remove("dark_mode_layer");
    element.classList.add("light_mode_layer");
  }
} else if (mode == "dark") {
  document.getElementById("mode_button").innerHTML = '<i class="material-icons">dark_mode</i>Dark Mode'
  if (element.classList.value == "") {
    element.classList.remove("light_mode_layer");
    element.classList.add("dark_mode_layer");
  }
} else if (mode == null) {
  document.getElementById("mode_button").innerHTML = '<i class="material-icons">light_mode</i>Light Mode'
  localStorage.setItem("mode", "light");
}
function toggle_func() {
  let mode = localStorage.getItem("mode");
  let element = document.getElementById("layer_cover");
  if (mode == "dark") {
    document.getElementById("mode_button").innerHTML = '<i class="material-icons">light_mode</i>Light Mode'
    if (element.classList.value == "dark_mode_layer") {
      element.classList.remove("dark_mode_layer");
      element.classList.add("light_mode_layer");
    }
    localStorage.setItem("mode", "light");
  } else if (mode == "light"){
    document.getElementById("mode_button").innerHTML = '<i class="material-icons">dark_mode</i>Dark Mode'
    if (element.classList.value == "light_mode_layer") {
      element.classList.remove("light_mode_layer");
      element.classList.add("dark_mode_layer");
    }
    localStorage.setItem("mode", "dark");
  }
}