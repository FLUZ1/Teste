// Função de inicialização específica para a página de Planejamento
function initializeGanttPage() {
    google.charts.load('current', {'packages':['gantt']});
    google.charts.setOnLoadCallback(setupGanttListeners);

    function loadTasksFromStorage() {
        const stored = localStorage.getItem('planejamento-tasks');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                return parsed.map(task => ({
                    ...task,
                    start: new Date(task.start),
                    end: new Date(task.end)
                }));
            } catch (e) {
                console.warn('Erro ao carregar tarefas do localStorage:', e);
                return [];
            }
        }
        return [];
    }

    function saveTasksToStorage(tasks) {
        const serializable = tasks.map(task => ({
            ...task,
            start: task.start.toISOString(),
            end: task.end.toISOString()
        }));
        localStorage.setItem('planejamento-tasks', JSON.stringify(serializable));
    }

    function setupGanttListeners() {
        const addTaskBtn = document.getElementById('add-task-btn');
        const editTaskBtn = document.getElementById('edit-task-btn');
        const taskNameInput = document.getElementById('task-name');
        const startDateInput = document.getElementById('start-date');
        const taskDurationInput = document.getElementById('task-duration');
        const taskDependencyInput = document.getElementById('task-dependency');
        const taskDependencyTypeInput = document.getElementById('task-dependency-type');
        const taskCostInput = document.getElementById('task-cost');
        const taskProgressInput = document.getElementById('task-progress');
        const taskTableBody = document.getElementById('task-table-body');
        const clearBtn = document.getElementById('clear-btn');
        const controlDateInput = document.getElementById('control-date');
        const ganttContainer = document.getElementById('gantt-container');

        function parseLocalDate(dateStr) {
            const [year, month, day] = dateStr.split('-').map(Number);
            return new Date(year, month - 1, day);
        }

        let tasks = loadTasksFromStorage();
        let editingIndex = -1;

        controlDateInput.addEventListener('change', renderTableAndChart);

        function renderTableAndChart() {
            renderTable();
            drawGanttChart();
        }

        function resetForm() {
            taskNameInput.value = '';
            startDateInput.value = '';
            taskDurationInput.value = '';
            taskDependencyInput.value = '';
            taskDependencyTypeInput.value = 'TI';
            taskCostInput.value = '';
            taskProgressInput.value = '';
            addTaskBtn.style.display = 'inline-flex';
            editTaskBtn.style.display = 'none';
            editingIndex = -1;
        }

        addTaskBtn.addEventListener('click', () => {
            const name = taskNameInput.value.trim();
            const start = startDateInput.value;
            const duration = parseInt(taskDurationInput.value, 10);
            const dependency = taskDependencyInput.value.trim();
            const dependencyType = taskDependencyTypeInput.value;
            const cost = parseFloat(taskCostInput.value) || 0;
            const progress = taskProgressInput.value;
            if (!name || !start || isNaN(duration) || duration < 0) {
                alert('Por favor, preencha nome, início e duração.');
                return;
            }
            const startDate = parseLocalDate(start);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + duration);
            let dependencyString = null;
            if (dependency) {
                dependencyString = `${dependency},${dependencyType}`;
            }
            const newTask = {
                id: 'Task' + tasks.length,
                name: name,
                start: startDate,
                end: endDate,
                duration: duration,
                progress: parseInt(progress) || 0,
                dependencies: dependencyString,
                cost: cost
            };
            tasks.push(newTask);
            saveTasksToStorage(tasks);
            renderTableAndChart();
            resetForm();
            taskNameInput.focus();
        });

        editTaskBtn.addEventListener('click', () => {
            const name = taskNameInput.value.trim();
            const start = startDateInput.value;
            const duration = parseInt(taskDurationInput.value, 10);
            const dependency = taskDependencyInput.value.trim();
            const dependencyType = taskDependencyTypeInput.value;
            const cost = parseFloat(taskCostInput.value) || 0;
            const progress = taskProgressInput.value;
            if (!name || !start || isNaN(duration) || duration < 0) {
                alert('Por favor, preencha nome, início e duração.');
                return;
            }
            const startDate = parseLocalDate(start);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + duration);
            let dependencyString = null;
            if (dependency) {
                dependencyString = `${dependency},${dependencyType}`;
            }
            tasks[editingIndex] = {
                ...tasks[editingIndex],
                name: name,
                start: startDate,
                end: endDate,
                duration: duration,
                progress: parseInt(progress) || 0,
                dependencies: dependencyString,
                cost: cost
            };
            saveTasksToStorage(tasks);
            renderTableAndChart();
            resetForm();
        });

        function renderTable() {
            taskTableBody.innerHTML = '';
            if (tasks.length === 0) {
                taskTableBody.innerHTML = '<tr><td colspan="10" class="text-center text-gray-500 py-4">Nenhuma atividade adicionada.</td></tr>';
                return;
            }
            const controlDate = controlDateInput.value ? parseLocalDate(controlDateInput.value) : null;
            tasks.forEach((task, index) => {
                const row = document.createElement('tr');
                const plannedProgress = controlDate ? calculatePlannedProgress(task, controlDate) : 'N/A';
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${task.id}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${task.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${task.start.toLocaleDateString('pt-BR')}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${task.end.toLocaleDateString('pt-BR')}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${task.duration}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${task.dependencies ? task.dependencies.replace(',', ' ') : 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${task.cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${plannedProgress === 'N/A' ? 'N/A' : plannedProgress + '%'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${task.progress}%</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button class="edit-btn" data-index="${index}">✏️</button>
                    </td>
                `;
                taskTableBody.appendChild(row);
            });
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(e.currentTarget.dataset.index);
                    const task = tasks[index];
                    editingIndex = index;
                    taskNameInput.value = task.name;
                    startDateInput.value = task.start.toISOString().split('T')[0];
                    taskDurationInput.value = task.duration;
                    if (task.dependencies) {
                        const [depId, depType] = task.dependencies.split(',');
                        taskDependencyInput.value = depId;
                        taskDependencyTypeInput.value = depType;
                    } else {
                        taskDependencyInput.value = '';
                        taskDependencyTypeInput.value = 'TI';
                    }
                    taskCostInput.value = task.cost;
                    taskProgressInput.value = task.progress;
                    addTaskBtn.style.display = 'none';
                    editTaskBtn.style.display = 'inline-flex';
                });
            });
        }

        function calculatePlannedProgress(task, controlDate) {
            const startDate = new Date(task.start);
            const endDate = new Date(task.end);
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

        function drawGanttChart() {
            ganttContainer.innerHTML = '';
            if (tasks.length === 0) return;
            const data = new google.visualization.DataTable();
            data.addColumn('string', 'Task ID');
            data.addColumn('string', 'Task Name');
            data.addColumn('date', 'Start Date');
            data.addColumn('date', 'End Date');
            data.addColumn('number', 'Duration');
            data.addColumn('number', 'Percent Complete');
            data.addColumn('string', 'Dependencies');

            const dataRows = tasks.map(task => {
                const dependencyId = task.dependencies ? task.dependencies.split(',')[0] : null;
                return [
                    task.id,
                    task.name,
                    task.start,
                    task.end,
                    null,
                    task.progress,
                    dependencyId
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

        clearBtn.addEventListener('click', () => {
            if (confirm('Tem certeza de que deseja limpar todas as tarefas?')) {
                tasks = [];
                saveTasksToStorage(tasks);
                renderTableAndChart();
                resetForm();
            }
        });

        renderTableAndChart();
    }
}