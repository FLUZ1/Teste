// Função de inicialização específica para a página de Atas
function initializeAtasPage() {
    const addRowBtn = document.getElementById('add-row-btn');
    const tableBody = document.getElementById('atas-table-body');
    const filterStatus = document.getElementById('filter-status');
    const filterTema = document.getElementById('filter-tema');
    const applyFiltersBtn = document.getElementById('apply-filters-btn');

    // Modal elements (já carregados via paginas.js)
    const modal = document.getElementById('descricao-modal');
    const modalTextarea = document.getElementById('modal-descricao-input');
    const modalSaveBtn = document.getElementById('modal-save-btn');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');
    let currentDescricaoCell = null;

    // Funções auxiliares
    function saveAtasToStorage(rows) {
        const data = [];
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length < 8) return; // Ajuste para 8 células (ID, Descrição, Tema, Responsável, Status, Abertura, Fechamento, Ações)
            data.push({
                id: cells[0].textContent.trim(),
                descricao: cells[1].querySelector('.descricao-text').textContent,
                tema: cells[2].querySelector('.tema-text').textContent,
                responsavel: cells[3].querySelector('.responsavel-text').textContent,
                status: getStatusValueFromText(cells[4].querySelector('.status-text').classList),
                dataAbertura: cells[5].querySelector('.data-abertura-text').textContent,
                dataFechamento: cells[6].querySelector('.data-fechamento-text').textContent
            });
        });
        localStorage.setItem('atas-reuniao', JSON.stringify(data));
    }

    function loadAtasFromStorage() {
        const stored = localStorage.getItem('atas-reuniao');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.warn('Erro ao carregar atas do localStorage:', e);
                return null;
            }
        }
        return null;
    }

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

    function getStatusValueFromText(classList) {
        if (classList.contains('status-informativo')) return 'informativo';
        if (classList.contains('status-aberto')) return 'aberto';
        if (classList.contains('status-critico')) return 'critico';
        if (classList.contains('status-fechado')) return 'fechado';
        return 'informativo';
    }

    function getCurrentDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function updateKPIs() {
        const rows = document.querySelectorAll('#atas-table-body tr');
        let totalItems = 0;
        let closedItems = 0;
        let openItems = 0;
        let totalDays = 0;
        rows.forEach(row => {
            if (row.style.display === 'none') return;
            const statusCell = row.querySelector('.status-text');
            const status = getStatusValueFromText(statusCell.classList);
            if (status !== 'informativo') {
                totalItems++;
                if (status === 'fechado') {
                    closedItems++;
                    const openDateText = row.querySelector('.data-abertura-text').textContent;
                    const closeDateText = row.querySelector('.data-fechamento-text').textContent;
                    if (openDateText && closeDateText && closeDateText !== '-' && closeDateText !== '') {
                        const openDate = new Date(openDateText);
                        const closeDate = new Date(closeDateText);
                        const diffTime = Math.abs(closeDate - openDate);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        totalDays += diffDays;
                    }
                } else if (status === 'aberto' || status === 'critico') {
                    openItems++;
                }
            }
        });
        const atendimentoConstrutora = totalItems > 0 ? Math.round((closedItems / totalItems) * 100) : 0;
        document.getElementById('kpi-construtora').textContent = `${atendimentoConstrutora}%`;
        document.getElementById('kpi-fechados').textContent = closedItems;
        const tempoMedio = closedItems > 0 ? Math.round(totalDays / closedItems) : 0;
        document.getElementById('kpi-tempo').textContent = `${tempoMedio} dias`;
    }

    function createAtaRow(id, descricao, tema, responsavel, status, dataAbertura, dataFechamento) {
        const row = document.createElement('tr');
        const statusClass = getStatusClassFromValue(status);
        const statusText = getStatusTextFromValue(status);
        row.innerHTML = `
            <td class="px-6 py-4 text-sm font-medium text-gray-900 text-center">${id}</td>
            <td class="px-6 py-4 text-sm text-gray-500 descricao-cell">
                <span class="descricao-text">${descricao}</span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                <span class="tema-text">${tema}</span>
                <select class="tema-select hidden w-full p-1 border rounded">
                    <option value="Contrato"${tema === 'Contrato' ? ' selected' : ''}>Contrato</option>
                    <option value="Qualidade"${tema === 'Qualidade' ? ' selected' : ''}>Qualidade</option>
                    <option value="Segurança"${tema === 'Segurança' ? ' selected' : ''}>Segurança</option>
                    <option value="Meio Ambiente"${tema === 'Meio Ambiente' ? ' selected' : ''}>Meio Ambiente</option>
                    <option value="Obra"${tema === 'Obra' ? ' selected' : ''}>Obra</option>
                    <option value="Outros"${tema === 'Outros' ? ' selected' : ''}>Outros</option>
                </select>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                <span class="responsavel-text">${responsavel}</span>
                <input type="text" class="responsavel-input w-full p-1 border rounded hidden" value="${responsavel}">
            </td>
            <td class="px-6 py-4 text-sm whitespace-nowrap">
                <span class="status-text ${statusClass}">${statusText}</span>
                <select class="status-select hidden w-full p-1 border rounded">
                    <option value="informativo"${status === 'informativo' ? ' selected' : ''}>Informativo</option>
                    <option value="aberto"${status === 'aberto' ? ' selected' : ''}>Aberto</option>
                    <option value="critico"${status === 'critico' ? ' selected' : ''}>Crítico</option>
                    <option value="fechado"${status === 'fechado' ? ' selected' : ''}>Fechado</option>
                </select>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                <span class="data-abertura-text">${dataAbertura}</span>
                <input type="date" class="data-abertura-input hidden w-full p-1 border rounded" value="${dataAbertura}">
            </td>
            <td class="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                <span class="data-fechamento-text">${dataFechamento}</span>
                <input type="date" class="data-fechamento-input hidden w-full p-1 border rounded"${dataFechamento !== '-' ? ` value="${dataFechamento}"` : ''}>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                <button class="btn-edit px-2 py-1 rounded text-xs mr-1">Editar</button>
                <button class="btn-save px-2 py-1 rounded text-xs mr-1 hidden">Salvar</button>
                <button class="btn-cancel px-2 py-1 rounded text-xs mr-1 hidden">Cancelar</button>
                <button class="btn-remove px-2 py-1 rounded text-xs">Remover</button>
            </td>
        `;
        return row;
    }

    function attachRowEvents(row) {
        const editBtn = row.querySelector('.btn-edit');
        const saveBtn = row.querySelector('.btn-save');
        const cancelBtn = row.querySelector('.btn-cancel');
        const removeBtn = row.querySelector('.btn-remove');
        const descricaoCell = row.querySelector('.descricao-cell');
        const descricaoText = descricaoCell.querySelector('.descricao-text');
        const temaText = row.querySelector('.tema-text');
        const temaSelect = row.querySelector('.tema-select');
        const responsavelText = row.querySelector('.responsavel-text');
        const responsavelInput = row.querySelector('.responsavel-input');
        const statusText = row.querySelector('.status-text');
        const statusSelect = row.querySelector('.status-select');
        const dataAberturaText = row.querySelector('.data-abertura-text');
        const dataAberturaInput = row.querySelector('.data-abertura-input');
        const dataFechamentoText = row.querySelector('.data-fechamento-text');
        const dataFechamentoInput = row.querySelector('.data-fechamento-input');

        editBtn.addEventListener('click', () => {
            // Salva valor atual da descrição para o modal
            modalTextarea.value = descricaoText.textContent;
            currentDescricaoCell = descricaoCell;
            // Mostra modal
            modal.classList.add('active');
            // Mostra campos editáveis dos demais campos
            temaText.classList.add('hidden');
            temaSelect.classList.remove('hidden');
            responsavelText.classList.add('hidden');
            responsavelInput.classList.remove('hidden');
            statusText.classList.add('hidden');
            statusSelect.classList.remove('hidden');
            dataAberturaText.classList.add('hidden');
            dataAberturaInput.classList.remove('hidden');
            dataFechamentoText.classList.add('hidden');
            dataFechamentoInput.classList.remove('hidden');
            editBtn.classList.add('hidden');
            saveBtn.classList.remove('hidden');
            cancelBtn.classList.remove('hidden');
            // Define valor do select de status
            statusSelect.value = getStatusValueFromText(statusText.classList);
        });

        saveBtn.addEventListener('click', () => {
            // Fecha modal
            modal.classList.remove('active');
            // Atualiza descrição com o valor do modal
            descricaoText.textContent = modalTextarea.value.trim() || 'Sem descrição';
            // Atualiza demais campos
            temaText.textContent = temaSelect.value;
            responsavelText.textContent = responsavelInput.value || '-';
            dataAberturaText.textContent = dataAberturaInput.value || '-';
            dataFechamentoText.textContent = dataFechamentoInput.value || '-';
            // Atualiza status
            statusText.className = 'status-text';
            statusText.classList.add(getStatusClassFromValue(statusSelect.value));
            statusText.textContent = getStatusTextFromValue(statusSelect.value);
            // Esconde campos editáveis
            descricaoText.classList.remove('hidden');
            temaText.classList.remove('hidden');
            temaSelect.classList.add('hidden');
            responsavelText.classList.remove('hidden');
            responsavelInput.classList.add('hidden');
            statusText.classList.remove('hidden');
            statusSelect.classList.add('hidden');
            dataAberturaText.classList.remove('hidden');
            dataAberturaInput.classList.add('hidden');
            dataFechamentoText.classList.remove('hidden');
            dataFechamentoInput.classList.add('hidden');
            editBtn.classList.remove('hidden');
            saveBtn.classList.add('hidden');
            cancelBtn.classList.add('hidden');
            updateKPIs();
            saveAtasToStorage(document.querySelectorAll('#atas-table-body tr'));
        });

        cancelBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            currentDescricaoCell = null;
            descricaoText.classList.remove('hidden');
            temaText.classList.remove('hidden');
            temaSelect.classList.add('hidden');
            responsavelText.classList.remove('hidden');
            responsavelInput.classList.add('hidden');
            statusText.classList.remove('hidden');
            statusSelect.classList.add('hidden');
            dataAberturaText.classList.remove('hidden');
            dataAberturaInput.classList.add('hidden');
            dataFechamentoText.classList.remove('hidden');
            dataFechamentoInput.classList.add('hidden');
            editBtn.classList.remove('hidden');
            saveBtn.classList.add('hidden');
            cancelBtn.classList.add('hidden');
        });

        removeBtn.addEventListener('click', () => {
            if (confirm('Tem certeza que deseja remover esta linha?')) {
                row.remove();
                updateKPIs();
                saveAtasToStorage(document.querySelectorAll('#atas-table-body tr'));
            }
        });

        statusSelect.addEventListener('change', updateKPIs);
        temaSelect.addEventListener('change', updateKPIs);
    }

    // Carregar dados salvos
    const savedAtas = loadAtasFromStorage();
    let nextId = 1;
    if (savedAtas && savedAtas.length > 0) {
        tableBody.innerHTML = '';
        savedAtas.forEach(item => {
            const newRow = createAtaRow(
                item.id,
                item.descricao,
                item.tema,
                item.responsavel,
                item.status,
                item.dataAbertura,
                item.dataFechamento
            );
            tableBody.appendChild(newRow);
            attachRowEvents(newRow);
            nextId = Math.max(nextId, parseInt(item.id) + 1);
        });
    } else {
        // Manter as linhas iniciais se não houver dados salvos
        document.querySelectorAll('#atas-table-body tr').forEach(row => {
            attachRowEvents(row);
            const id = parseInt(row.cells[0].textContent);
            nextId = Math.max(nextId, id + 1);
        });
    }

    function applyFilters() {
        const statusFilter = filterStatus.value;
        const temaFilter = filterTema.value;
        const rows = document.querySelectorAll('#atas-table-body tr');
        rows.forEach(row => {
            const statusCell = row.querySelector('.status-text');
            const temaCell = row.querySelector('.tema-text');
            const status = getStatusValueFromText(statusCell.classList);
            const tema = temaCell.textContent;
            const statusMatch = statusFilter === '' || status === statusFilter;
            const temaMatch = temaFilter === '' || tema === temaFilter;
            row.style.display = (statusMatch && temaMatch) ? '' : 'none';
        });
        updateKPIs();
    }

    applyFiltersBtn.addEventListener('click', applyFilters);
    filterStatus.addEventListener('change', applyFilters);
    filterTema.addEventListener('change', applyFilters);

    addRowBtn.addEventListener('click', () => {
        const today = getCurrentDate();
        const newRow = createAtaRow(
            nextId,
            'Nova descrição',
            'Contrato',
            '-',
            'informativo',
            today,
            '-'
        );
        tableBody.appendChild(newRow);
        attachRowEvents(newRow);
        nextId++;
        updateKPIs();
        saveAtasToStorage(document.querySelectorAll('#atas-table-body tr'));
    });

    // Modal handlers (já carregados via paginas.js)
    modalSaveBtn.addEventListener('click', () => {
        if (currentDescricaoCell) {
            const textSpan = currentDescricaoCell.querySelector('.descricao-text');
            textSpan.textContent = modalTextarea.value.trim() || 'Sem descrição';
            currentDescricaoCell = null;
        }
        modal.classList.remove('active');
        updateKPIs();
        saveAtasToStorage(document.querySelectorAll('#atas-table-body tr'));
    });
    modalCancelBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        currentDescricaoCell = null;
    });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            currentDescricaoCell = null;
        }
    });

    updateKPIs(); // Atualiza KPIs iniciais após carregar
}