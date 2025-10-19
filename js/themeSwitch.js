let lightmode = localStorage.getItem('lightmode');
const themeswitch = document.getElementById('theme-switch');

const enableLightmode = () => {
    document.body.classList.add('lightmode');
    localStorage.setItem('lightmode', 'active');
}

const disableLightmode = () => {
    document.body.classList.remove('lightmode');
    localStorage.setItem('lightmode', ''); 
}

if (lightmode === 'active') enableLightmode();

themeswitch.addEventListener("click", () => {
    lightmode = localStorage.getItem('lightmode');
    lightmode !== "active" ? enableLightmode() : disableLightmode();
});
