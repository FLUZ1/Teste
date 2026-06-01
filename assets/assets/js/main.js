document.addEventListener('DOMContentLoaded', function () {
    const navLinks = document.querySelectorAll('nav a');
    const mainContent = document.getElementById('main-content');
    const landingPage = document.getElementById('landing-page');
    const ctaButton = document.getElementById('cta-button');
    let planejamentoInicializado = false;

    // Função para carregar e exibir uma página (definida em paginas.js)
    // A função loadPage será chamada por outros eventos

    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); // Impede o comportamento padrão do link
            const navId = event.currentTarget.id;
            const pageId = (navId === 'nav-home') ? 'landing-page' : navId.replace('nav-', '') + '.html';
            loadPage(pageId);

            // Atualiza classe 'active' no link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    ctaButton.addEventListener('click', () => {
        const pageId = 'planejamento.html';
        loadPage(pageId);
        // Atualiza classe 'active' no link de planejamento
        navLinks.forEach(l => l.classList.remove('active'));
        document.getElementById('nav-planejamento').classList.add('active');
    });

    // Carrega a página inicial (landing page inline)
    showPage('landing-page');

    function showPage(pageId) {
        // Esconde todas as páginas dinamicamente carregadas e a landing page
        const pages = document.querySelectorAll('.page-content');
        pages.forEach(page => page.style.display = 'none');
        landingPage.style.display = 'none';

        if (pageId === 'landing-page') {
            landingPage.style.display = 'flex';
            navLinks.forEach(link => {
                link.classList.toggle('active', link.id === 'nav-home');
            });
        } else {
            // A lógica de exibir páginas dinâmicas será feita em loadPage
            // e a classe 'active' será atualizada lá também
        }
    }
});