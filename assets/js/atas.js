// Função de inicialização específica para a página de Atas
function initializeAtasPage() {
    const tableBody = document.getElementById('atas-table-body');
    const filterStatus = document.getElementById('filter-status');
    const filterTema = document.getElementById('filter-tema');
    const applyFiltersBtn = document.getElementById('apply-filters-btn');

    // Caminho para o arquivo JSON local
    const JSON_PATH = 'assets/data/atas.json';

    // Função para carregar e processar dados do JSON local
    async function loadAtasFromJson() {
        try {
            const response = await fetch(JSON_PATH);
            if (!response.ok) {
                throw new Error(`Erro ao carregar dados: ${response.status}`);
            }
            const rows = await response.json();
            return rows;
        } catch (error) {
            console.error("Erro ao carregar dados do JSON de Atas:", error);
            tableBody.innerHTML = `<tr><td colspan="8" class="text-center text-red-500 py-4">Erro ao carregar dados.</td></tr>`;
            updateKPIs([]);
            return [];
        }
    }

    // ... (restante da lógica de renderTableRows, updateKPIs, applyFilters, createAtaRow, etc., igual às versões anteriores) ...

    // Carregar dados e renderizar
    loadAtasFromJson().then(atas => {
        renderTableRows(atas);
        updateKPIs(atas);
        applyFiltersBtn.addEventListener('click', () => applyFilters(atas));
        filterStatus.addEventListener('change', () => applyFilters(atas));
        filterTema.addEventListener('change', () => applyFilters(atas));
    });
}