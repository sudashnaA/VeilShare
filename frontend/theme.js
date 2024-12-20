let themeVal = sessionStorage.getItem('theme');
const theme = document.getElementById('theme');

if (themeVal === 'dark'){
    theme.setAttribute('href', 'dark.css');
}
else{
    theme.setAttribute('href', 'light.css');
}