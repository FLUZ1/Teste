// Função para carregar conteúdo HTML de um arquivo
async function loadHTML(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erro ao carregar ${url}: ${response.statusText}`);
        }
        return await response.text();
    } catch (error) {
        console.error(error);
        return `<p>Erro ao carregar o conteúdo: ${error.message}</p>`;
    }
}

// Função para carregar e exibir uma página específica
async function loadPage(pageId) {
    const mainContent = document.getElementById('main-content');
    let url = '';

    switch (pageId) {
        case 'landing-page':
            // A landing page está inline no index.html, então apenas a mostramos
            showPage('landing-page');
            return; // Sai da função após mostrar a landing page
        case 'atas.html':
            url = 'assets/pages/atas.html';
            break;
        case 'projeto.html':
            url = 'assets/pages/projeto.html';
            break;
        case 'planejamento.html':
            url = 'assets/pages/planejamento.html';
            break;
        case 'riscos.html':
            url = 'assets/pages/riscos.html';
            break;
        case 'custos.html':
            url = 'assets/pages/custos.html';
            break;
        case 'gestao-cava.html':
            url = 'assets/pages/gestao-cava.html';
            break;
        default:
            console.warn('Página não encontrada:', pageId);
            return;
    }

    if (url) {
        mainContent.innerHTML = await loadHTML(url);

        // Após carregar, inicializa a lógica específica da página
        if (typeof initializeAtasPage === 'function' && pageId === 'atas.html') {
            initializeAtasPage();
        } else if (typeof initializeGanttPage === 'function' && pageId === 'planejamento.html') {
            initializeGanttPage();
        }
        // Adicione outros 'else if' conforme necessário para outras páginas
        // Exemplo:
        // else if (typeof initializeRiscosPage === 'function' && pageId === 'riscos.html') {
        //     initializeRiscosPage();
        // }
    }
}

// Função para carregar o modal (separado)
async function loadModal(modalId, placeholderId) {
    const placeholder = document.getElementById(placeholderId);
    const modalHTML = await loadHTML(`modal/${modalId}.html`);
    placeholder.innerHTML = modalHTML;
}

// Carregar o modal quando a página principal carregar
document.addEventListener('DOMContentLoaded', function () {
    loadModal('descricao-modal', 'descricao-modal-placeholder');
});

// Função auxiliar para mostrar a landing page (inline)
function showPage(pageId) {
    const pages = document.querySelectorAll('.page-content');
    pages.forEach(page => page.style.display = 'none');
    const landingPage = document.getElementById('landing-page');
    if (pageId === 'landing-page') {
        landingPage.style.display = 'flex';
    }
}