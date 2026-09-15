const state = {
  profile: 'resident',
  selectedPark: 0,
  activeView: 'home',
  loggedIn: false,
  dashboardName: 'Ana Silva',
  map: null,
  markers: [],
  parks: [
    {
      id: 1,
      name: 'Parque da Fonte',
      zone: 'Centro',
      distance: '4 min',
      price: '€2,50/h',
      availability: 10,
      status: 'Disponível',
      tariff: 'Até 2h · €2,50/h',
      rules: 'Zona tarifada, acesso para residentes e visitantes.',
      description: 'Parque central com boa mobilidade e acesso direto à biblioteca municipal.',
      location: [38.8032, -9.3908]
    },
    {
      id: 2,
      name: 'Parque do Mercado',
      zone: 'Santa Maria',
      distance: '7 min',
      price: '€1,80/h',
      availability: 5,
      status: 'Quase cheio',
      tariff: 'Até 3h · €1,80/h',
      rules: 'Pagamento via app e acesso prioritário para trabalhadores.',
      description: 'Parque mais próximo do mercado municipal e da zona comercial.',
      location: [38.7813, -9.3870]
    },
    {
      id: 3,
      name: 'Parque da Estação',
      zone: 'Sintra',
      distance: '11 min',
      price: '€3,00/h',
      availability: 0,
      status: 'Cheio',
      tariff: 'Sem vagas disponíveis no momento',
      rules: 'Sugestão de estacionamento alternativo na zona adjacente.',
      description: 'Parque ligado à estação e ao centro de negócios da cidade.',
      location: [38.7990, -9.3609]
    }
  ],
  vehicles: [
    '80-AA-15',
    '22-BB-74'
  ],
  payments: [
    { id: 'P-1023', amount: '€3,50', status: 'Confirmado', date: 'Hoje, 09:14' },
    { id: 'P-1022', amount: '€6,00', status: 'Confirmado', date: 'Ontem, 18:13' }
  ],
  invoices: [
    { id: 'FAT-2201', amount: '€12,00', date: '12 Ago' },
    { id: 'FAT-2202', amount: '€8,50', date: '08 Ago' }
  ],
  news: [
    {
      id: 1,
      title: 'Obras em Rua do Comércio',
      category: 'Aviso',
      date: '15 ago',
      resume: 'Atualização de sinalização temporária em duas zonas de estacionamento.',
      content: 'Durante os próximos cinco dias, a sinalização de acesso ao parque da Rua do Comércio será ajustada para facilitar o fluxo de veículos e garantir a continuidade do serviço público.'
    },
    {
      id: 2,
      title: 'Novos horários de tarifa',
      category: 'Notícia',
      date: '12 ago',
      resume: 'A partir de setembro, a tarifação passa a ter ajustes em quatro zonas.',
      content: 'A EMES vai introduzir ajustes nas tarifas de pico em vários parques da zona central e de acesso à estação, mantendo a política de discriminação por perfil.'
    },
    {
      id: 3,
      title: 'Campanha de sensibilização',
      category: 'Evento',
      date: '09 ago',
      resume: 'Sessão pública sobre mobilidade e utilização dos espaços de estacionamento.',
      content: 'A sessão será organizada em parceria com a Câmara Municipal e terá como foco a otimização dos espaços de estacionamento e o uso responsável dos serviços digitais.'
    }
  ],
  supportRequests: [],
  disticRequests: []
};

const elements = {
  navButtons: document.querySelectorAll('.nav-btn'),
  loginToggle: document.getElementById('loginToggle'),
  loginModal: document.getElementById('loginModal'),
  closeModal: document.querySelector('.close-modal'),
  views: document.querySelectorAll('.view'),
  selectedParkName: document.getElementById('selectedParkName'),
  selectedParkMeta: document.getElementById('selectedParkMeta'),
  parkList: document.getElementById('parkList'),
  parkingList: document.getElementById('parkingList'),
  parkDetail: document.getElementById('parkDetail'),
  profileChips: document.querySelectorAll('.profile-chip'),
  panels: document.querySelectorAll('.profile-panel'),
  newsList: document.getElementById('newsList'),
  newsDetail: document.getElementById('newsDetail'),
  vehicleList: document.getElementById('vehicleList'),
  invoiceList: document.getElementById('invoiceList'),
  adminRequests: document.getElementById('adminRequests')
};

function setView(name) {
  state.activeView = name;
  elements.views.forEach((view) => view.classList.toggle('active', view.id === `${name}View`));
  elements.navButtons.forEach((button) => button.classList.toggle('active', button.dataset.view === name));
}

function initMap() {
  if (!window.L) return;

  state.map = L.map('map', {
    zoomControl: true,
    scrollWheelZoom: true
  }).setView([38.7974, -9.3816], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(state.map);

  state.markers = state.parks.map((park) => {
    const marker = L.marker(park.location).addTo(state.map);
    marker.bindPopup(`${park.name}<br>${park.availability} vagas livres`);
    marker.on('click', () => {
      state.selectedPark = state.parks.findIndex((item) => item.name === park.name);
      renderSelectedPark();
      renderParkList();
      renderParkingList();
    });
    return marker;
  });

  state.map.flyTo(state.parks[0].location, 12);
}

function searchAddress(address) {
  if (!address || !window.fetch) {
    alert('Introduza uma morada para pesquisar.');
    return;
  }

  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(address)}`;

  fetch(url, {
    headers: {
      'Accept': 'application/json'
    }
  })
    .then((response) => response.json())
    .then((results) => {
      if (!results.length) {
        alert('Não foi encontrada nenhuma morada. Tente outra pesquisa.');
        return;
      }

      const result = results[0];
      const coords = [Number(result.lat), Number(result.lon)];
      if (state.map) {
        state.map.flyTo(coords, 15);
        L.marker(coords).addTo(state.map).bindPopup(`Resultado: ${result.display_name}`).openPopup();
      }
      alert(`Morada encontrada: ${result.display_name}`);
    })
    .catch(() => {
      alert('Não foi possível consultar a morada. Tente novamente mais tarde.');
    });
}

function renderParkList() {
  const searchTerm = document.getElementById('searchInput')?.value?.trim().toLowerCase() || '';
  const filtered = state.parks.filter((park) => {
    const haystack = `${park.name} ${park.zone} ${park.description}`.toLowerCase();
    return haystack.includes(searchTerm);
  });

  elements.parkList.innerHTML = filtered.map((park, index) => `
    <div class="result-card ${index === state.selectedPark ? 'active' : ''}" data-index="${index}">
      <div class="row">
        <strong>${park.name}</strong>
        <span class="tag ${park.status === 'Disponível' ? 'success' : park.status === 'Quase cheio' ? 'warning' : 'error'}">${park.status}</span>
      </div>
      <small>${park.zone} · ${park.distance} · ${park.price}</small>
      <small>${park.availability} vagas livres</small>
    </div>
  `).join('');

  document.querySelectorAll('.result-card').forEach((card) => {
    card.addEventListener('click', () => {
      state.selectedPark = Number(card.dataset.index);
      renderParkList();
      renderSelectedPark();
      renderParkingList();
    });
  });
}

function renderParkingList() {
  const list = state.parks.map((park, index) => `
    <div class="parking-item ${index === state.selectedPark ? 'active' : ''}">
      <div>
        <strong>${park.name}</strong>
        <small>${park.zone} · ${park.distance}</small>
      </div>
      <button class="secondary-btn small" data-parking-index="${index}">Selecionar</button>
    </div>
  `).join('');

  elements.parkingList.innerHTML = list;
  elements.parkingList.querySelectorAll('[data-parking-index]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.selectedPark = Number(btn.dataset.parkingIndex);
      renderSelectedPark();
      renderParkList();
      renderParkingList();
    });
  });
}

function renderSelectedPark() {
  const park = state.parks[state.selectedPark];
  elements.selectedParkName.textContent = park.name;
  elements.selectedParkMeta.textContent = `${park.availability} vagas livres · ${park.distance}`;
  elements.parkDetail.innerHTML = `
    <h4>${park.name}</h4>
    <p>${park.description}</p>
    <ul>
      <li><strong>Zona:</strong> ${park.zone}</li>
      <li><strong>Tarifa:</strong> ${park.tariff}</li>
      <li><strong>Estado:</strong> ${park.status}</li>
      <li><strong>Disponibilidade:</strong> ${park.availability} vagas</li>
      <li><strong>Regras:</strong> ${park.rules}</li>
    </ul>
  `;
}

function renderProfile() {
  elements.profileChips.forEach((chip) => {
    chip.classList.toggle('active', chip.dataset.profile === state.profile);
  });

  elements.panels.forEach((panel) => {
    panel.classList.toggle('active', panel.dataset.panel === state.profile);
  });
}

function renderNews() {
  elements.newsList.innerHTML = state.news.map((item) => `
    <li class="news-item ${item.id === state.selectedNewsId ? 'active' : ''}" data-news-id="${item.id}">
      <strong>${item.title}</strong>
      <small>${item.category} · ${item.date}</small>
      <span>${item.resume}</span>
    </li>
  `).join('');

  const selected = state.news.find((item) => item.id === state.selectedNewsId) || state.news[0];
  state.selectedNewsId = selected.id;
  elements.newsDetail.innerHTML = `
    <h3>${selected.title}</h3>
    <p><strong>${selected.category}</strong> · ${selected.date}</p>
    <p>${selected.content}</p>
  `;

  elements.newsList.querySelectorAll('.news-item').forEach((item) => {
    item.addEventListener('click', () => {
      state.selectedNewsId = Number(item.dataset.newsId);
      renderNews();
    });
  });
}

function renderVehicles() {
  elements.vehicleList.innerHTML = state.vehicles.map((vehicle) => `
    <li>
      <strong>${vehicle}</strong>
      <small>Veículo associado</small>
    </li>
  `).join('');
}

function renderInvoices() {
  elements.invoiceList.innerHTML = state.invoices.map((invoice) => `
    <li>
      <strong>${invoice.id}</strong>
      <small>${invoice.date} · ${invoice.amount}</small>
    </li>
  `).join('');
}

function renderBackoffice() {
  const requests = [
    { name: 'Pedido dístico - Ana Silva', status: 'Pendente' },
    { name: 'Pagamento parque - M. Costa', status: 'Aprovado' },
    { name: 'Pedido apoio - J. Santos', status: 'Em análise' }
  ];

  elements.adminRequests.innerHTML = requests.map((request) => `
    <li>
      <strong>${request.name}</strong>
      <small>${request.status}</small>
    </li>
  `).join('');
}

function setupEvents() {
  elements.navButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setView(button.dataset.view);
      if (button.dataset.view === 'mobile') {
        setView('mobile');
      }
    });
  });

  document.querySelectorAll('[data-view]').forEach((button) => {
    button.addEventListener('click', () => {
      const view = button.dataset.view;
      if (view === 'home' || view === 'parking' || view === 'profiles' || view === 'services' || view === 'updates' || view === 'support' || view === 'backoffice' || view === 'mobile') {
        setView(view);
      }
    });
  });

  document.getElementById('searchBtn').addEventListener('click', () => {
    const query = document.getElementById('searchInput').value.trim();
    if (query) {
      searchAddress(query);
    } else {
      renderParkList();
    }
  });

  document.getElementById('searchInput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      const query = event.currentTarget.value.trim();
      if (query) {
        searchAddress(query);
      }
    }
  });

  document.getElementById('searchInput').addEventListener('input', renderParkList);

  document.querySelector('.mobile-menu-toggle').addEventListener('click', () => {
    const wrapper = document.querySelector('.nav-wrapper');
    const isOpen = wrapper.classList.toggle('menu-open');
    document.querySelector('.mobile-menu-toggle').setAttribute('aria-expanded', String(isOpen));
  });

  document.getElementById('directionBtn').addEventListener('click', () => {
    const park = state.parks[state.selectedPark];
    alert(`Navegação ativada para ${park.name}. A rota foi calculada pela aplicação.`);
  });

  document.getElementById('saveBtn').addEventListener('click', () => {
    const park = state.parks[state.selectedPark];
    alert(`Opção guardada: ${park.name}.`);
  });

  document.getElementById('loginToggle').addEventListener('click', () => {
    elements.loginModal.classList.remove('hidden');
  });

  elements.closeModal.addEventListener('click', () => {
    elements.loginModal.classList.add('hidden');
  });

  document.getElementById('loginForm').addEventListener('submit', (event) => {
    event.preventDefault();
    state.loggedIn = true;
    elements.loginModal.classList.add('hidden');
    alert(`Bem-vindo(a), ${state.dashboardName}!`);
  });

  document.querySelectorAll('.profile-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      state.profile = chip.dataset.profile;
      renderProfile();
    });
  });

  document.getElementById('disticForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = formData.get('name');
    const nif = formData.get('nif');
    const address = formData.get('address');

    if (!name || !nif || !address) {
      showFeedback('disticFeedback', 'Preencha todos os campos obrigatórios.', 'error');
      return;
    }

    state.disticRequests.push({ name, nif, zone: formData.get('zone'), status: 'Pendente' });
    showFeedback('disticFeedback', `Pedido de dístico submetido com sucesso para ${name}.`, 'success');
    form.reset();
  });

  document.getElementById('vehicleForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const plate = new FormData(form).get('plate');
    if (!plate) {
      showFeedback('vehicleFeedback', 'Indique a matrícula.', 'error');
      return;
    }
    state.vehicles.push(String(plate));
    renderVehicles();
    showFeedback('vehicleFeedback', `Veículo ${plate} associado com sucesso.`, 'success');
    form.reset();
  });

  document.getElementById('paymentForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const amount = Number(formData.get('amount'));
    if (amount <= 0) {
      showFeedback('paymentFeedback', 'O valor deve ser superior a zero.', 'error');
      return;
    }

    const payment = { id: `P-${Math.floor(Math.random() * 10000)}`, amount: `€${amount.toFixed(2)}`, status: 'Confirmado', date: 'Agora' };
    state.payments.unshift(payment);
    showFeedback('paymentFeedback', `Pagamento de ${payment.amount} confirmado com sucesso.`, 'success');
    form.reset();
  });

  document.getElementById('extendForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const minutes = new FormData(event.currentTarget).get('minutes');
    showFeedback('extendFeedback', `Extensão de ${minutes} minutos registada com sucesso.`, 'success');
    event.currentTarget.reset();
  });

  document.getElementById('supportForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    state.supportRequests.push({
      type: formData.get('type'),
      email: formData.get('email'),
      message: formData.get('message')
    });
    showFeedback('supportFeedback', 'Pedido de apoio registado com sucesso.', 'success');
    form.reset();
  });

  document.querySelectorAll('.filter-check').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const enabled = Array.from(document.querySelectorAll('.filter-check:checked')).map((box) => box.dataset.filter);
      if (!enabled.length) {
        alert('Selecione pelo menos um filtro para continuar.');
        checkbox.checked = true;
      }
    });
  });
}

function showFeedback(elementId, message, type = 'success') {
  const target = document.getElementById(elementId);
  target.textContent = message;
  target.style.color = type === 'error' ? '#dc4b5d' : '#0d9f6e';
}

function init() {
  state.selectedNewsId = state.news[0].id;
  renderParkList();
  renderSelectedPark();
  renderParkingList();
  renderProfile();
  renderNews();
  renderVehicles();
  renderInvoices();
  renderBackoffice();
  setupEvents();
  initMap();
  setView('home');
}

init();
