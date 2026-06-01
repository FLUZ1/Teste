// Função de inicialização específica para a página de Atas
function initializeAtasPage() {
    const tableBody = document.getElementById('atas-table-body');
    const filterStatus = document.getElementById('filter-status');
    const filterTema = document.getElementById('filter-tema');
    const applyFiltersBtn = document.getElementById('apply-filters-btn');
    const addRowBtn = document.getElementById('add-row-btn'); // Botão para adicionar nova linha

    // Caminho para o arquivo JSON local
    const JSON_PATH = 'assets/data/atas.json';

    // Função para carregar e processar dados do JSON local
    async function loadAtasFromJson() {
        try {
            console.log("Tentando carregar dados de:", JSON_PATH); // Log para debug
            const response = await fetch(JSON_PATH);
            if (!response.ok) {
                throw new Error(`Erro ao carregar dados: ${response.status} ${response.statusText}`);
            }
            // A mágica do JSON: response.json() converte automaticamente
            const rows = await response.json();
            console.log("Dados JSON carregados:", rows); // Log para debug
            return rows;
        } catch (error) {
            console.error("Erro ao carregar dados do JSON de Atas:", error);
            // Mostrar mensagem de erro na interface
            tableBody.innerHTML = `<tr><td colspan="8" class="text-center text-red-500 py-4">Erro ao carregar dados: ${error.message}</td></tr>`;
            updateKPIs([]); // Atualiza KPIs com dados vazios
            return [];
        }
    }

    // Função para renderizar as linhas da tabela
    function renderTableRows(atas) {
        tableBody.innerHTML = '';
        if (atas.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8" class="text-center text-gray-500 py-4">Nenhuma ata encontrada.</td></tr>';
            return;
        }
        atas.forEach(item => {
            const row = createAtaRow(
                item.ID, // Certifique-se que o nome da propriedade no JSON é 'ID'
                item.Descricao, // Certifique-se que o nome da propriedade no JSON é 'Descricao'
                item.Tema, // Certifique-se que o nome da propriedade no JSON é 'Tema'
                item.Responsavel, // Certifique-se que o nome da propriedade no JSON é 'Responsavel'
                item.Status, // Certifique-se que o nome da propriedade no JSON é 'Status'
                item.DataAbertura, // Certifique-se que o nome da propriedade no JSON é 'DataAbertura'
                item.DataFechamento // Certifique-se que o nome da propriedade no JSON é 'DataFechamento'
            );
            tableBody.appendChild(row);
            // Adicione event listeners apenas para ações que não envolvam edição/exclusão direta
            // Por exemplo, para o botão de editar, você pode redirecionar para o Google Sheets
            const editBtn = row.querySelector('.btn-edit');
            if (editBtn) { // Verifique se o botão existe antes de adicionar o listener
                 editBtn.addEventListener('click', () => {
                    // Exemplo: Redirecionar para o Google Sheets para edição manual
                    // Substitua pela URL real da sua planilha ou arquivo fonte
                    alert("A edição deve ser feita manualmente na fonte de dados (JSON).");
                    // window.open('https://docs.google.com/spreadsheets/d/[ID_DA_PLANILHA]/edit', '_blank');
                });
            }
        });
    }

    // Função para atualizar KPIs com base nos dados carregados
    function updateKPIs(atas) {
        let totalItems = 0;
        let closedItems = 0;
        let totalDays = 0;
        atas.forEach(item => {
            // Garanta que os campos existem e são strings antes de comparar
            const status = (item.Status || '').toString().toLowerCase(); // Converte para string e minúsculo
            if (status && status !== 'informativo') { // Verifique se status não é vazio ou nulo também
                totalItems++;
                if (status === 'fechado') {
                    closedItems++;
                    const openDateText = item.DataAbertura;
                    const closeDateText = item.DataFechamento;
                    if (openDateText && closeDateText && closeDateText !== '-' && closeDateText !== '') {
                        const openDate = new Date(openDateText);
                        const closeDate = new Date(closeDateText);
                        // Verifique se as datas são válidas
                        if (!isNaN(openDate.getTime()) && !isNaN(closeDate.getTime())) {
                             const diffTime = Math.abs(closeDate - openDate);
                             const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                             totalDays += diffDays;
                        } else {
                            console.warn("Datas inválidas encontradas:", openDateText, closeDateText);
                        }
                    }
                }
            }
        });
        const atendimentoConstrutora = totalItems > 0 ? Math.round((closedItems / totalItems) * 100) : 0;
        document.getElementById('kpi-construtora').textContent = `${atendimentoConstrutora}%`;
        document.getElementById('kpi-fechados').textContent = closedItems;
        const tempoMedio = closedItems > 0 ? Math.round(totalDays / closedItems) : 0;
        document.getElementById('kpi-tempo').textContent = `${tempoMedio} dias`;
    }

    // Função para aplicar filtros localmente
    function applyFilters(atas) {
        const statusFilter = filterStatus.value;
        const temaFilter = filterTema.value;
        const rows = document.querySelectorAll('#atas-table-body tr');
        rows.forEach((row, index) => {
            const item = atas[index];
            if (!item) return; // Verificação de segurança

            const status = (item.Status || '').toString().toLowerCase(); // Converte para string e minúsculo
            const tema = item.Tema || ''; // Garante que tema é uma string
            const statusMatch = statusFilter === '' || status === statusFilter.toLowerCase();
            const temaMatch = temaFilter === '' || tema === temaFilter;
            row.style.display = (statusMatch && temaMatch) ? '' : 'none';
        });
        // Atualiza KPIs após aplicar filtros
        const filteredAtas = atas.filter(item => {
            if (!item) return false; // Filtra itens nulos/undefined
            const status = (item.Status || '').toString().toLowerCase();
            const tema = item.Tema || '';
            const statusMatch = statusFilter === '' || status === statusFilter.toLowerCase();
            const temaMatch = temaFilter === '' || tema === temaFilter;
            return statusMatch && temaMatch;
        });
        updateKPIs(filteredAtas);
    }

    // Função para criar uma linha da tabela (somente leitura)
    function createAtaRow(id, descricao, tema, responsavel, status, dataAbertura, dataFechamento) {
        const row = document.createElement('tr');
        const statusClass = getStatusClassFromValue(status.toLowerCase()); // Supondo status em minúsculo no CSS
        const statusText = getStatusTextFromValue(status.toLowerCase());
        row.innerHTML = `
            <td class="px-4 py-3 text-sm font-medium text-gray-900 text-center">${id}</td>
            <td class="px-4 py-3 text-sm text-gray-500 descricao-cell">
                <span class="descricao-text">${descricao}</span>
            </td>
            <td class="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                <span class="tema-text">${tema}</span>
            </td>
            <td class="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                <span class="responsavel-text">${responsavel}</span>
            </td>
            <td class="px-4 py-3 text-sm whitespace-nowrap">
                <span class="status-text ${statusClass}">${statusText}</span>
            </td>
            <td class="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                <span class="data-abertura-text">${dataAbertura}</span>
            </td>
            <td class="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                <span class="data-fechamento-text">${dataFechamento || '-'}</span>
            </td>
            <td class="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                <button class="btn-edit px-2 py-1 rounded text-xs mr-1">Editar (Fonte)</button> <!-- Indicativo de edição na fonte -->
                <!-- Remover botões de salvar/cancelar/remover -->
            </td>
        `;
        return row;
    }

    // Funções auxiliares para status
    function getStatusClassFromValue(value) {
        switch(value) {
            case 'informativo': return 'status-informativo';
            case 'aberto': return 'status-aberto';
            case 'critico': return 'status-critico';
            case 'fechado': return 'status-fechado';
            default: return 'status-informativo';
        }
    }
    function getStatusTextFromValue(value) {
        switch(value) {
            case 'informativo': return 'Informativo';
            case 'aberto': return 'Aberto';
            case 'critico': return 'Crítico';
            case 'fechado': return 'Fechado';
            default: return 'Informativo';
        }
    }

    // Carregar dados e renderizar
    loadAtasFromJson().then(atas => {
        renderTableRows(atas);
        updateKPIs(atas);
        // Configurar filtros
        applyFiltersBtn.addEventListener('click', () => applyFilters(atas));
        filterStatus.addEventListener('change', () => applyFilters(atas));
        filterTema.addEventListener('change', () => applyFilters(atas));
    });

    // Remover ou desativar a funcionalidade de adicionar nova linha localmente
    if (addRowBtn) { // Verifique se o botão existe
        addRowBtn.style.display = 'none'; // Oculta o botão
    }
}

// Certifique-se de que a função initializeAtasPage esteja disponível globalmente
// window.initializeAtasPage = initializeAtasPage; // Opcional, dependendo de como main.js chama