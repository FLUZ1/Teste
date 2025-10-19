// Função de inicialização específica para a página de Planejamento
function initializeGanttPage() {
    google.charts.load('current', {'packages':['gantt']});
    google.charts.setOnLoadCallback(setupGanttListeners);

    function setupGanttListeners() {
        // ... (configuração de elementos) ...

        // Caminho para o arquivo JSON local
        const JSON_PATH = 'assets/data/planejamento.json';

        // Função para carregar e processar dados do JSON local
        async function loadTasksFromJson() {
            try {
                const response = await fetch(JSON_PATH);
                if (!response.ok) {
                    throw new Error(`Erro ao carregar dados: ${response.status}`);
                }
                const rows = await response.json();
                return rows.map(task => ({
                    ...task,
                    Inicio: new Date(task.Inicio),
                    Termino: new Date(task.Termino),
                    Duracao: parseInt(task.Duracao, 10) || 0,
                    Custo: parseFloat(task.Custo) || 0,
                    AvancoReal: parseInt(task.AvancoReal, 10) || 0
                }));
            } catch (error) {
                console.error("Erro ao carregar dados do JSON de Planejamento:", error);
                taskTableBody.innerHTML = `<tr><td colspan="10" class="text-center text-red-500 py-4">Erro ao carregar dados.</td></tr>`;
                ganttContainer.innerHTML = '<p class="text-red-500">Erro ao carregar gráfico.</p>';
                return [];
            }
        }

        // ... (restante da lógica de renderTable, drawGanttChart, etc., igual às versões anteriores) ...

        // Carregar dados e renderizar
        loadTasksFromJson().then(tasks => {
            renderTableAndChart(tasks);
            controlDateInput.addEventListener('change', () => {
                renderTableAndChart(tasks);
            });
        });
    }
}