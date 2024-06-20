let currentDropdown = null;

function toggleDropdown(id) {
  const dropdown = document.getElementById(id);
  const menuItem = document.getElementById('header_menu');

  if (dropdown.style.display === 'flex') {
    dropdown.style.display = 'none';
    menuItem.classList.remove('active');
    currentDropdown = null;
  } else {
    if (currentDropdown) {
      currentDropdown.style.display = 'none';
      menuItem.classList.remove('active');
    }
    dropdown.style.display = 'flex';
    menuItem.classList.add('active');
    currentDropdown = dropdown;
  }
}

document.addEventListener('click', function(event) {
  const dropdown = currentDropdown;
  const menuItem = document.getElementById('header_menu');
  if (dropdown && !dropdown.contains(event.target) && !menuItem.contains(event.target)) {
    dropdown.style.display = 'none';
    menuItem.classList.remove('active');
    currentDropdown = null;
  }
});