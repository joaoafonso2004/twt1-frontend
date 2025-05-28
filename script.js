// JS para operações CRUD com Fetch API

const API_URL = 'https://backend-3gjv.onrender.com/alunos';
const CURSOS_API_URL = 'https://backend-3gjv.onrender.com/cursos';

const form = document.getElementById('aluno-form');
const idInput = document.getElementById('aluno-id');
const nomeInput = document.getElementById('nome');
const idadeInput = document.getElementById('idade');
const salvarBtn = document.getElementById('salvar-btn');
const cancelarBtn = document.getElementById('cancelar-btn');
const tabela = document.getElementById('alunos-table').querySelector('tbody');

const cursoForm = document.getElementById('curso-form');
const cursoIdInput = document.getElementById('curso-id');
const cursoIdNumberInput = document.getElementById('curso_id'); // novo campo
const nomeCursoInput = document.getElementById('nome-curso');
const salvarCursoBtn = document.getElementById('salvar-curso-btn');
const cancelarCursoBtn = document.getElementById('cancelar-curso-btn');
const cursosTabela = document.getElementById('cursos-table').querySelector('tbody');

const apagarBtn = document.getElementById('apagar-btn');
const apagarCursoBtn = document.getElementById('apagar-curso-btn');

let editando = false;
let editandoCurso = false;
let cursosCache = [];

async function carregarCursos() {
    cursosTabela.innerHTML = '<tr><td colspan="3">Carregando...</td></tr>';
    try {
        const resp = await fetch(CURSOS_API_URL);
        const cursos = await resp.json();
        cursosCache = cursos; // <-- cache dos cursos para uso em alunos
        cursosTabela.innerHTML = '';
        if (!Array.isArray(cursos) || cursos.length === 0) {
            cursosTabela.innerHTML = '<tr><td colspan="3">Nenhum curso cadastrado.</td></tr>';
        } else {
            cursos.forEach(curso => {
                const id = curso.curso_id || curso.id || '';
                const nome = curso.nomeDoCurso || curso.nome || '';
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${id}</td>
                    <td>${nome}</td>
                    <td>
                        <button class="acao editar" data-id="${curso._id}" data-nome="${nome}">Editar</button>
                    </td>
                `;
                cursosTabela.appendChild(tr);
            });
        }
        preencherSelectCursos(cursos);
    } catch (e) {
        cursosTabela.innerHTML = '<tr><td colspan="3">Erro ao carregar cursos.</td></tr>';
    }
}

async function carregarAlunos() {
    tabela.innerHTML = '<tr><td colspan="6">Carregando...</td></tr>';
    try {
        const resp = await fetch(API_URL);
        const alunos = await resp.json();
        tabela.innerHTML = '';
        if (!Array.isArray(alunos) || alunos.length === 0) {
            tabela.innerHTML = '<tr><td colspan="6">Nenhum aluno cadastrado.</td></tr>';
        } else {
            alunos.forEach(aluno => {
                const cc = aluno.cc ?? '';
                const nome = aluno.nome || '';
                const apelido = aluno.apelido || '';
                const idade = aluno.idade ?? '';
                const curso_id = aluno.curso ?? aluno.curso_id ?? '';
                const id = aluno._id || aluno.id || '';
                // Procurar o nome do curso pelo ID
                const cursoObj = cursosCache.find(c => String(c.curso_id) === String(curso_id));
                const nomeCurso = cursoObj ? (cursoObj.nomeDoCurso || cursoObj.nome || curso_id) : curso_id;
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${cc}</td>
                    <td>${nome}</td>
                    <td>${apelido}</td>
                    <td>${idade}</td>
                    <td>${nomeCurso}</td>
                    <td>
                        <button class="acao editar" 
                            data-id="${id}" 
                            data-cc="${cc}"
                            data-nome="${nome}" 
                            data-apelido="${apelido}"
                            data-idade="${idade}" 
                            data-curso="${curso_id}">Editar</button>
                    </td>
                `;
                tabela.appendChild(tr);
            });
        }
    } catch (e) {
        tabela.innerHTML = '<tr><td colspan="6">Erro ao carregar alunos.</td></tr>';
    }
}

function preencherSelectCursos(cursos) {
    const select = document.getElementById('curso');
    select.innerHTML = '<option value="">Selecione o curso</option>';
    cursos.forEach(curso => {
        const id = curso.curso_id || curso.id || '';
        const nome = curso.nomeDoCurso || curso.nome || '';
        const option = document.createElement('option');
        option.value = id;
        option.textContent = `${id} - ${nome}`;
        select.appendChild(option);
    });
}

// Delegação de eventos para os botões de editar/apagar
tabela.onclick = async (e) => {
    const btn = e.target;
    if (btn.classList.contains('editar')) {
        editando = true;
        idInput.value = btn.getAttribute('data-id');
        nomeInput.value = btn.getAttribute('data-nome');
        if (document.getElementById('apelido')) {
            document.getElementById('apelido').value = btn.getAttribute('data-apelido');
        }
        if (document.getElementById('curso')) {
            document.getElementById('curso').value = btn.getAttribute('data-curso');
        }
        idadeInput.value = btn.getAttribute('data-idade');
        salvarBtn.textContent = 'Salvar';
        cancelarBtn.style.display = 'inline-block';
        apagarBtn.style.display = 'inline-block'; // Mostra o botão apagar
    }
    if (btn.classList.contains('apagar')) {
        const id = btn.getAttribute('data-id');
        if (confirm('Deseja realmente apagar este aluno?')) {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            carregarAlunos();
        }
    }
};

cursosTabela.onclick = async (e) => {
    const btn = e.target;
    if (btn.classList.contains('editar')) {
        editandoCurso = true;
        cursoIdInput.value = btn.getAttribute('data-id');
        cursoIdNumberInput.value = btn.parentElement.parentElement.children[0].textContent;
        nomeCursoInput.value = btn.getAttribute('data-nome');
        salvarCursoBtn.textContent = 'Salvar';
        cancelarCursoBtn.style.display = 'inline-block';
        apagarCursoBtn.style.display = 'inline-block'; // Mostra o botão apagar
    }
    if (btn.classList.contains('apagar')) {
        const id = btn.getAttribute('data-id');
        if (confirm('Deseja realmente apagar este curso?')) {
            await fetch(`${CURSOS_API_URL}/${id}`, { method: 'DELETE' });
            carregarCursos();
        }
    }
};

form.onsubmit = async (e) => {
    e.preventDefault();
    const nome = nomeInput.value.trim();
    const apelido = document.getElementById('apelido').value.trim();
    const idade = parseInt(idadeInput.value, 10);
    const curso = document.getElementById('curso').value;

    if (!nome || !apelido || isNaN(idade) || !curso) return;

    const alunoData = { nome, apelido, idade, curso };

    if (editando && idInput.value) {
        await fetch(`${API_URL}/${idInput.value}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(alunoData)
        });
    } else {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(alunoData)
        });
    }
    cancelarEdicao();
    carregarAlunos();
};

cursoForm.onsubmit = async (e) => {
    e.preventDefault();
    const curso_id = cursoIdNumberInput.value;
    const nome = nomeCursoInput.value.trim();
    if (!curso_id || !nome) return;
    const cursoData = { curso_id, nomeDoCurso: nome };
    if (editandoCurso && cursoIdInput.value) {
        await fetch(`${CURSOS_API_URL}/${cursoIdInput.value}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cursoData)
        });
    } else {
        await fetch(CURSOS_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cursoData)
        });
    }
    cancelarEdicaoCurso();
    carregarCursos();
};

cancelarBtn.onclick = cancelarEdicao;

function cancelarEdicao() {
    editando = false;
    idInput.value = '';
    form.reset();
    salvarBtn.textContent = 'Adicionar';
    cancelarBtn.style.display = 'none';
    apagarBtn.style.display = 'none'; // Esconde o botão apagar
}

cancelarCursoBtn.onclick = cancelarEdicaoCurso;

function cancelarEdicaoCurso() {
    editandoCurso = false;
    cursoIdInput.value = '';
    cursoForm.reset();
    salvarCursoBtn.textContent = 'Adicionar';
    cancelarCursoBtn.style.display = 'none';
    apagarCursoBtn.style.display = 'none'; // Esconde o botão apagar
}

apagarBtn.onclick = async () => {
    if (!idInput.value) return;
    if (confirm('Deseja realmente apagar este aluno?')) {
        await fetch(`${API_URL}/${idInput.value}`, { method: 'DELETE' });
        cancelarEdicao();
        carregarAlunos();
    }
};

apagarCursoBtn.onclick = async () => {
    if (!cursoIdInput.value) return;
    if (confirm('Deseja realmente apagar este curso?')) {
        await fetch(`${CURSOS_API_URL}/${cursoIdInput.value}`, { method: 'DELETE' });
        cancelarEdicaoCurso();
        carregarCursos();
    }
};

// No final do ficheiro, garanta que cursos são carregados antes dos alunos:
(async () => {
    await carregarCursos();
    await carregarAlunos();
})();