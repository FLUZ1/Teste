document.addEventListener('DOMContentLoaded', function () {
    const navLinks = document.querySelectorAll('nav a');
    const pages = document.querySelectorAll('.page-content');
    const landingPage = document.getElementById('landing-page');
    const ctaButton = document.getElementById('cta-button');
    let planejamentoInicializado = false;

    function hideAllPages() {
        pages.forEach(page => page.style.display = 'none');
        landingPage.style.display = 'none';
    }

    function showPage(pageId) {
        hideAllPages();
        const pageToShow = document.getElementById(pageId);
        if (pageToShow) {
            pageToShow.style.display = 'block';
            if (pageId === 'landing-page') {
                pageToShow.style.display = 'flex';
            }
        }
        navLinks.forEach(link => {
            const linkPageId = (link.id === 'nav-home') ? 'landing-page' : link.id.replace('nav-', '') + '-page';
            link.classList.toggle('active', linkPageId === pageId);
        });
        // Inicializa a lógica específica da página
        if (pageId === 'atas-page') {
            if (typeof initializeAtasPage === 'function') {
                initializeAtasPage();
            }
        }
        if (pageId === 'planejamento-page' && !planejamentoInicializado) {
            if (typeof initializeGanttPage === 'function') {
                initializeGanttPage();
                planejamentoInicializado = true;
            }
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const navId = event.currentTarget.id;
            const pageId = (navId === 'nav-home') ? 'landing-page' : navId.replace('nav-', '') + '-page';
            showPage(pageId);
        });
    });

    ctaButton.addEventListener('click', (event) => {
        event.preventDefault();
        showPage('planejamento-page');
    });

    // Mostra a página inicial
    showPage('landing-page');
});