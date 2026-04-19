// Nav toggle
document.querySelectorAll(".nav-toggle").forEach((navToggle) => {
  navToggle.addEventListener("click", () => {
    document.getElementById("navContainer").classList.toggle("-translate-x-full");
  });
});

// Check empty link of image
document.querySelectorAll("img").forEach((img) => {
  if (!img.getAttribute("src")) {
    img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
  };
});