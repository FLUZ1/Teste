// Função de inicialização específica para a página de Planejamento
function initializeGanttPage() {
    // Certifique-se de que o Google Charts está carregado
    if (typeof google === 'undefined' || !google.charts) {
        console.error("Google Charts não carregado.");
        return;
    }
    google.charts.load('current', {'packages':['gantt']});
    google.charts.setOnLoadCallback(setupGanttListeners);

    function setupGanttListeners() {
        const taskTableBody = document.getElementById('task-table-body');
        const controlDateInput = document.getElementById('control-date');
        const ganttContainer = document.getElementById('gantt-container');

        // URL da planilha de Planejamento publicada como CSV
        const SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQtG2h4TnlFEMcH017tsOjYl00-wnnTXB3henwgqaS4UV_ZVRCwhQp5RIf4OZB0CNY33b94YsKx4ByV/pub?output=csv';

        // Função para carregar e processar dados da planilha
        async function loadTasksFromSheet() {
            try {
                console.log("Tentando carregar dados de:", SPREADSHEET_URL); // Log para debug
                const response = await fetch(SPREADSHEET_URL);
                if (!response.ok) {
                    throw new Error(`Erro ao carregar dados: ${response.status} ${response.statusText}`);
                }
                const csvText = await response.text();
                console.log("CSV recebido:", csvText); // Log para debug
                const rows = PapaParse.parse(csvText, { header: true, skipEmptyLines: true }).data; // Usando PapaParse
                console.log("Dados parseados:", rows); // Log para debug
                // Converter datas para objetos Date
                return rows.map(task => ({
                    ...task,
                    Inicio: new Date(task.Inicio), // Certifique-se que o nome da coluna no CSV é 'Inicio'
                    Termino: new Date(task.Termino), // Certifique-se que o nome da coluna no CSV é 'Termino'
                    Duracao: parseInt(task.Duracao, 10) || 0, // Certifique-se que o nome da coluna no CSV é 'Duracao'
                    Custo: parseFloat(task.Custo) || 0, // Certifique-se que o nome da coluna no CSV é 'Custo'
                    AvancoReal: parseInt(task.AvancoReal, 10) || 0, // Certifique-se que o nome da coluna no CSV é 'AvancoReal'
                    AvancoPlanejado: parseInt(task.AvancoPlanejado, 10) || 0 // Certifique-se que o nome da coluna no CSV é 'AvancoPlanejado'
                }));
            } catch (error) {
                console.error("Erro ao carregar dados da planilha de Planejamento:", error);
                taskTableBody.innerHTML = `<tr><td colspan="10" class="text-center text-red-500 py-4">Erro ao carregar dados: ${error.message}</td></tr>`;
                ganttContainer.innerHTML = '<p class="text-red-500">Erro ao carregar gráfico.</p>';
                return [];
            }
        }

        // Função para renderizar a tabela de tarefas
        function renderTable(tasks) {
            taskTableBody.innerHTML = '';
            if (tasks.length === 0) {
                taskTableBody.innerHTML = '<tr><td colspan="10" class="text-center text-gray-500 py-4">Nenhuma atividade encontrada.</td></tr>';
                return;
            }
            const controlDate = controlDateInput.value ? new Date(controlDateInput.value) : null;
            tasks.forEach((task, index) => {
                const row = document.createElement('tr');
                const plannedProgress = controlDate ? calculatePlannedProgress(task, controlDate) : 'N/A';
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${task.ID}</td> <!-- Certifique-se que o nome da coluna no CSV é 'ID' -->
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${task.NomeTarefa}</td> <!-- Certifique-se que o nome da coluna no CSV é 'NomeTarefa' -->
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${task.Inicio.toLocaleDateString('pt-BR')}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${task.Termino.toLocaleDateString('pt-BR')}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${task.Duracao}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${task.Predecessora || 'N/A'}</td> <!-- Certifique-se que o nome da coluna no CSV é 'Predecessora' -->
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${task.Custo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${plannedProgress === 'N/A' ? 'N/A' : plannedProgress + '%'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${task.AvancoReal}%</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button class="edit-btn" onclick="alert('Edite no Google Sheets')">✏️ (GS)</button> <!-- Indicativo de edição no Google Sheets -->
                    </td>
                `;
                taskTableBody.appendChild(row);
            });
        }

        // Função para desenhar o gráfico Gantt
        function drawGanttChart(tasks) {
            ganttContainer.innerHTML = '';
            if (tasks.length === 0) {
                ganttContainer.innerHTML = '<p class="text-gray-500">Nenhuma atividade para exibir.</p>';
                return;
            }
            const data = new google.visualization.DataTable();
            data.addColumn('string', 'Task ID');
            data.addColumn('string', 'Task Name');
            data.addColumn('date', 'Start Date');
            data.addColumn('date', 'End Date');
            data.addColumn('number', 'Duration');
            data.addColumn('number', 'Percent Complete');
            data.addColumn('string', 'Dependencies');

            const dataRows = tasks.map(task => {
                // Ajuste o nome da coluna conforme sua planilha
                const dependencyId = task.Predecessora; // Supondo que 'Predecessora' seja o ID ou vazio
                return [
                    task.ID, // Certifique-se que o nome da coluna no CSV é 'ID'
                    task.NomeTarefa, // Certifique-se que o nome da coluna no CSV é 'NomeTarefa'
                    task.Inicio,
                    task.Termino,
                    null, // A API do Gantt lida com duração calculada, mas você pode passar task.Duracao também
                    task.AvancoReal,
                    dependencyId || null
                ];
            });
            data.addRows(dataRows);

            const chart = new google.visualization.Gantt(ganttContainer);
            const trackHeight = 24;
            const barHeight = 16;
            const chartHeight = 60 + (data.getNumberOfRows() * trackHeight);
            const options = {
                height: chartHeight,
                gantt: {
                    trackHeight: trackHeight,
                    barHeight: barHeight,
                    criticalPathEnabled: false,
                    arrow: {
                        angle: 20,
                        width: 0.8,
                        color: '#666',
                        radius: 2
                    },
                    palette: [
                        {
                            "color": "#01455C",
                            "dark": "#013346",
                            "light": "#3b7a91"
                        }
                    ]
                }
            };
            chart.draw(data, options);
        }

        // Função para calcular progresso planejado
        function calculatePlannedProgress(task, controlDate) {
            const startDate = new Date(task.Inicio);
            const endDate = new Date(task.Termino);
            // Verifique se as datas são válidas
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                console.warn("Datas inválidas encontradas para cálculo de progresso:", task.ID, task.Inicio, task.Termino);
                return 0; // Retorna 0 se as datas forem inválidas
            }
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(0, 0, 0, 0);
            const ctrl = new Date(controlDate);
            ctrl.setHours(0, 0, 0, 0);
            if (ctrl < startDate) return 0;
            if (ctrl >= endDate) return 100;
            const totalDuration = (endDate - startDate) / (1000 * 60 * 60 * 24);
            if (totalDuration <= 0) return 100;
            const elapsedDuration = (ctrl - startDate) / (1000 * 60 * 60 * 24);
            const percentage = (elapsedDuration / totalDuration) * 100;
            return Math.min(100, Math.round(percentage));
        }

        // Função para renderizar tabela e gráfico com base na data de controle
        function renderTableAndChart(tasks) {
            renderTable(tasks);
            drawGanttChart(tasks);
        }

        // Carregar dados e renderizar
        loadTasksFromSheet().then(tasks => {
            renderTableAndChart(tasks);

            // Adicionar listener para mudanças na data de controle
            controlDateInput.addEventListener('change', () => {
                renderTableAndChart(tasks); // Re-renderiza com a nova data de controle
            });
        });

        // Desativar botões de adição/edição/exclusão
        const addTaskBtn = document.getElementById('add-task-btn');
        const editTaskBtn = document.getElementById('edit-task-btn');
        const clearBtn = document.getElementById('clear-btn');
        if (addTaskBtn) addTaskBtn.style.display = 'none';
        if (editTaskBtn) editTaskBtn.style.display = 'none';
        if (clearBtn) clearBtn.style.display = 'none';
    }
}
// window.initializeGanttPage = initializeGanttPage; // Opcional