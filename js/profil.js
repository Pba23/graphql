// Other important pens.
// Map: https://codepen.io/themustafaomar/pen/ZEGJeZq
// Navbar: https://codepen.io/themustafaomar/pen/VKbQyZ
async function Login() {

  const accessToken = localStorage.getItem('accessToken');
  //accessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIzNzIyIiwiaWF0IjoxNzA1ODYwMzQwLCJpcCI6IjE1NC4xMjUuMTIyLjE0MywgMTcyLjE4LjAuMiIsImV4cCI6MTcwNTk0Njc0MCwiaHR0cHM6Ly9oYXN1cmEuaW8vand0L2NsYWltcyI6eyJ4LWhhc3VyYS1hbGxvd2VkLXJvbGVzIjpbInVzZXIiXSwieC1oYXN1cmEtY2FtcHVzZXMiOiJ7fSIsIngtaGFzdXJhLWRlZmF1bHQtcm9sZSI6InVzZXIiLCJ4LWhhc3VyYS11c2VyLWlkIjoiMzcyMiIsIngtaGFzdXJhLXRva2VuLWlkIjoiZDI3M2I2ZGYtNDMzMy00MGM1LWE5NzUtY2MzODAwZWQzYmVmIn19.Qipf6XW38y62qn0PnaR-_t1AcMUpeDGToOCDzkKHUsk"

  // Utilisation du token pour effectuer une requête GraphQL authentifiée
  const graphqlResponse = await fetchGraphQL(accessToken);
  const xp = await getUserXp(graphqlResponse.data.user[0].login, accessToken)
  const level = await getUserLevel(accessToken);
  // Vous pouvez traiter la réponse GraphQL ici

  document.head.innerHTML = `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../assets/styles/profil.css">
    <title>Talent's Platform</title>
    `
  document.body.innerHTML = `
    <header>
    <h1>Welcome, ${graphqlResponse.data.user[0].attrs.firstName} ${graphqlResponse.data.user[0].attrs.lastName} </h1>
    <button onclick="logOut()" id="log-out" >Log-out</button>
  </header>
  
  <section class="numbers-section">
    <div class="information">
      <h1>Country: ${graphqlResponse.data.user[0].attrs.country}</h1>
      <h1>Gender: ${graphqlResponse.data.user[0].attrs.gender}</h1>
      <h1>Email: ${graphqlResponse.data.user[0].attrs.email}</h1>
      <h1>Phone: ${graphqlResponse.data.user[0].attrs.phone}</h1>
    </div>
    <div class="number-card">
      <h2>XP</h2>
      <p>${xp.data.transaction_aggregate.aggregate.sum.amount}</p>
    </div>
    
    <div class="number-card">
      <h2>AuditRatio</h2>
      <p>${(graphqlResponse.data.user[0].auditRatio.toFixed(1))}</p>
    </div>
    <div class="number-card">
        <h2>Level</h2>
        <p>${level.data.transaction[0].amount}</p>
      </div>
  </section>
  
  <section class="graphs-section">
    <div class="graph-card">
      <h2>Xp earned by project</h2>
      
      </div>
    <svg id="barChart" width="400" height="300"></svg>
    
    </section>
    <script type="text/javascript" >
   
   
 
      

    </script>
    `

  const projects = await getProjectsXp(accessToken);
  // console.log(projects.data);
  const data = projects.data.transaction.map(project => project.amount);
  const projectName = projects.data.transaction.map(project => project.path.split("/")[3]);

  const barWidth = 20;
  const barSpacing = 1;
  const chartHeight = 300;
  const chartWidth = (barWidth + barSpacing) * data.length;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', chartWidth);
  svg.setAttribute('height', chartHeight);
  svg.style.borderLeft = '1px solid'
  //svg.setAttribute('border-left',);

  document.querySelector(".graph-card").appendChild(svg);

  for (let i = 0; i < data.length; i++) {
    const barHeight = (data[i] / (Math.max(...data))) * chartHeight;
    const barX = i * (barWidth + barSpacing);
    const barY = chartHeight - barHeight;

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', barX);
    rect.setAttribute('y', barY);
    rect.setAttribute('width', barWidth);
    rect.setAttribute('height', barHeight);
    rect.setAttribute('fill', 'white');
    rect.setAttribute('data-project-name', projectName[i]);
    rect.setAttribute('data-project-xp', data[i]);
    // Ajoutez le nom du projet correspondant à la barre

    // Ajoutez des gestionnaires d'événements pour le survol et la sortie du survol
    rect.addEventListener('mouseover', handleMouseOver);
    rect.addEventListener('mouseout', handleMouseOut);

    svg.appendChild(rect);
  }
  // Fonction pour gérer l'événement de survol
  function handleMouseOver(event) {
    // Récupérez le nom du projet à partir de l'attribut de données
    const projectName = event.target.getAttribute('data-project-name');
    const xp = event.target.getAttribute('data-project-xp');
    // Changez la couleur de la barre au survol
    event.target.setAttribute('fill', ' #03e9f4');

    // Créez le texte pour afficher le nom du projet
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', parseFloat(event.target.getAttribute('x')) + barWidth / 2 + 55);
    if (event.target.getAttribute('x') > 100) {
      text.setAttribute('x', parseFloat(event.target.getAttribute('x')) + barWidth / 2 - 75);
    }
    // console.log(event.target.getAttribute('y'));
    text.setAttribute('y', parseFloat(event.target.getAttribute('y')) - 10);
    if (event.target.getAttribute('y') == 0) {
      text.setAttribute('y', 15);
      text.setAttribute('x', parseFloat(event.target.getAttribute('x')) + barWidth / 2 - 90);
    }
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', ' #03e9f4');
    text.setAttribute('size', '3vh');
    text.textContent = `${projectName}(${(xp / 1000).toFixed(1)}k)`;

    // Ajoutez le texte au conteneur SVG
    svg.appendChild(text);
  }

  // Fonction pour gérer l'événement de sortie de survol
  function handleMouseOut() {
    // Supprimez tous les éléments texte lorsqu'on quitte la barre
    const texts = svg.querySelectorAll('text');
    event.target.setAttribute('fill', 'white');
    texts.forEach(text => text.remove());
  }
  const cercle = document.createElement("div")
  const pass = await projectPass(graphqlResponse.data.user[0].id, accessToken)
  countPass = pass.data.audit_aggregate.aggregate.count
  const fail = await projectFail(graphqlResponse.data.user[0].id, accessToken)
  countFail = fail.data.audit_aggregate.aggregate.count
  sum = countPass + countFail
  const percent = (countPass / sum * 100)
  // const xCoord = calculateEndpointX(countFail, countPass);
  // const yCoord = calculateEndpointY(countFail, countPass);
  const title = document.createElement("h2")
  title.innerHTML = `Percent of projects that you have validated/failed<br\> After ${sum} audits done`
  document.querySelector(".graph-card").appendChild(title)
  cercle.innerHTML = `
  <pie-chart data="${countFail};${countPass}"></pie-chart>

  `
  document.querySelector(".graph-card").appendChild(cercle)
  cercle.classList.add("cercle")

}


async function fetchGraphQL(token) {
  // Exemple de requête GraphQL
  const graphqlQuery = `
      {
        user {
          id
          login
          auditRatio
          attrs
        }
      }
    `;

  // En-têtes avec le token JWT pour l'authentification
  const graphqlHeaders = new Headers({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  });

  // Requête GraphQL authentifiée
  const graphqlResponse = await fetch('https://learn.zone01dakar.sn/api/graphql-engine/v1/graphql', {
    method: 'POST',
    headers: graphqlHeaders,
    body: JSON.stringify({ query: graphqlQuery }),
  });

  return await graphqlResponse.json();
}
async function getUserXp(name, token) {
  const graphqlQuery = `
    {
      transaction_aggregate(where: {event:{object :{type:{_eq:"module"}}},type:{_eq:"xp"}}) {
        aggregate{
          sum{
            amount
          }
        }
      }
    }
  `
    ;
  const graphqlHeaders = new Headers({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  });

  // Requête GraphQL authentifiée
  const graphqlResponse = await fetch('https://learn.zone01dakar.sn/api/graphql-engine/v1/graphql', {
    method: 'POST',
    headers: graphqlHeaders,
    body: JSON.stringify({ query: graphqlQuery }),
  });
  return await graphqlResponse.json();
}
async function getUserLevel(token) {
  const graphqlQuery = `
    {
      transaction(order_by : {amount:desc},limit : 1 , where : {type : {_eq : "level"}}){
        amount
      }
    }
  `
    ;
  const graphqlHeaders = new Headers({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  });

  // Requête GraphQL authentifiée
  const graphqlResponse = await fetch('https://learn.zone01dakar.sn/api/graphql-engine/v1/graphql', {
    method: 'POST',
    headers: graphqlHeaders,
    body: JSON.stringify({ query: graphqlQuery }),
  });
  return await graphqlResponse.json();
}
async function getProjectsXp(token) {
  const graphqlQuery = `
    {
      transaction(
        order_by : {createdAt:asc},
        where: {
          type: { _eq: "xp" }
          _and: [
            { path: { _ilike: "%div-01%" } }
            { path: { _nlike: "%checkpoint%" } }
            { path: { _nlike: "%piscine-js%" } }
          ]
        }
      ) {
        amount
        objectId
        path
      }
    }
  `
    ;
  const graphqlHeaders = new Headers({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  });

  // Requête GraphQL authentifiée
  const graphqlResponse = await fetch('https://learn.zone01dakar.sn/api/graphql-engine/v1/graphql', {
    method: 'POST',
    headers: graphqlHeaders,
    body: JSON.stringify({ query: graphqlQuery }),
  });
  return await graphqlResponse.json();
}
async function projectFail(userId, token) {
  const graphqlQuery = `
  {
    audit_aggregate(where:{auditorId:{_eq:${userId}},grade:{_lt:1}}) {
      aggregate{
        count
      }
    }
  }
  `
    ;
  const graphqlHeaders = new Headers({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  });

  // Requête GraphQL authentifiée
  const graphqlResponse = await fetch('https://learn.zone01dakar.sn/api/graphql-engine/v1/graphql', {
    method: 'POST',
    headers: graphqlHeaders,
    body: JSON.stringify({ query: graphqlQuery }),
  });
  return await graphqlResponse.json();
}
async function projectPass(userId, token) {
  const graphqlQuery = `
  {
    audit_aggregate(where:{auditorId:{_eq:${userId}},grade:{_gte:1}}) {
      aggregate{
        count
      }
    }
  }
  `
    ;
  const graphqlHeaders = new Headers({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  });

  // Requête GraphQL authentifiée
  const graphqlResponse = await fetch('https://learn.zone01dakar.sn/api/graphql-engine/v1/graphql', {
    method: 'POST',
    headers: graphqlHeaders,
    body: JSON.stringify({ query: graphqlQuery }),
  });
  return await graphqlResponse.json();
}

window.logOut = logOut

async function logOut() {
  localStorage.clear();
  window.location.href = "../graphql.html"
}
Login()
/**
 * Renvoie un élément HTML depuis une chaine
 * @param {string} str 
 * @returns {HTMLElement}
 */
function strToDom(str) {
  return document.createRange().createContextualFragment(str).firstChild;
}

function easeOutExpo(x) {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x)
}

/**
* Représente un point
* @property {number} x
* @property {number} y
*/
class Point {
  constructor(x, y) {
    this.x = x
    this.y = y
  }

  toSvgPath() {
    return `${this.x} ${this.y}`
  }

  static fromAngle(angle) {
    return new Point(Math.cos(angle), Math.sin(angle))
  }
}

/**
* @property {number[]} data
* @property {SVGPathElement[]} paths
* @property {SVGLineElement[]} lines
* @property {HTMLDivElement[]} labels
*/
class PieChart extends HTMLElement {
  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })

    // On prépare les paramètres
    const donut = this.getAttribute('donut') ?? '0.005'
    const gap = this.getAttribute('gap') ?? '0.015'
    const colors = this.getAttribute('colors')?.split(';') ?? ['white', '#03e9f4', '#FA6A25', '#0C94FA', '#FA1F19', '#0CFAE2', '#AB6D23'];
    this.data = this.getAttribute('data').split(';').map(v => parseFloat(v))
    const labels = this.getAttribute('labels')?.split(';') ?? []

    // On génère la structure du DOM nécessaire pour la suite
    const svg = strToDom(/*html*/`<svg viewBox="-1 -1 2 2">
          <g mask="url(#graphMask)"></g>
          <mask id="graphMask">
              <rect fill="white" x="-1" y="-1" width="2" height="2"/>
              <circle r="${donut}" fill="black"/>
          </mask>
      </svg>`)

    const pathGroup = svg.querySelector('g')
    const maskGroup = svg.querySelector('mask')
    this.paths = this.data.map((_, k) => {
      const color = colors[k % (colors.length - 1)]
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      path.setAttribute('fill', color)
      pathGroup.appendChild(path)
      path.addEventListener('mouseover', () => this.handlePathHover(k))
      path.addEventListener('mouseout', () => this.handlePathOut(k))
      return path
    })
    this.lines = this.data.map(() => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      line.setAttribute('stroke', '#000')
      line.setAttribute('stroke-width', gap)
      line.setAttribute('x1', '0')
      line.setAttribute('y1', '0')
      maskGroup.appendChild(line)
      return line
    })
    this.labels = labels.map((label) => {
      const div = document.createElement('div')
      div.innerText = label
      shadow.appendChild(div)
      return div
    })
    const style = document.createElement('style');
    style.innerHTML = /*css*/`
          :host {
              display: block;
              position: relative;
          }
          svg {
              width: 100%;
              height: 100%;
          }
          path {
              cursor: pointer;
              transition: opacity .3s;
          }
          path:hover {
              opacity: 0.5;
          }
          div {
              position: absolute;
              top: 0;
              left: 0;
              padding: .1em .2em;
              transform: translate(-50%, -50%);
              background-color: var(--tooltip-bg, #FFF);
              opacity: 0;
              transition: opacity .3s;
          }
          .is-active {
              opacity: 1;
          }
      `
    shadow.appendChild(style)
    shadow.appendChild(svg)
  }

  connectedCallback() {
    const now = Date.now()
    const duration = 1000
    const draw = () => {
      const t = (Date.now() - now) / duration
      if (t < 1) {
        this.draw(easeOutExpo(t))
        window.requestAnimationFrame(draw)
      } else {
        this.draw(1)
      }
    }
    window.requestAnimationFrame(draw)
  }

  /**
   * Dessine le graphique
   * @param {number} progress 
   */
  draw(progress = 1) {
    const total = this.data.reduce((acc, v) => acc + v, 0)
    let angle = Math.PI / -2
    let start = new Point(0, -1)
    for (let k = 0; k < this.data.length; k++) {
      this.lines[k].setAttribute('x2', start.x)
      this.lines[k].setAttribute('y2', start.y)
      const ratio = (this.data[k] / total) * progress
      if (progress === 1) {
        this.positionLabel(this.labels[k], angle + ratio * Math.PI)
      }
      angle += ratio * 2 * Math.PI
      const end = Point.fromAngle(angle)
      const largeFlag = ratio > .5 ? '1' : '0'
      this.paths[k].setAttribute('d', `M 0 0 L ${start.toSvgPath()} A 1 1 0 ${largeFlag} 1 ${end.toSvgPath()} L 0 0`)
      start = end
    }
  }

  /**
   * Gère l'effet lorsque l'on survol une section du graph
   * @param {number} k Index de l'élément survolé
   */
  handlePathHover(k) {
    this.dispatchEvent(new CustomEvent('sectionhover', { detail: k }))
    this.labels[k]?.classList.add('is-active')
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');

    const info = document.createElement('div')
    info.innerHTML = `Project failled(${this.data[k]})`
    if (k == 1) {
      info.innerHTML = `Project validated(${this.data[k]})`
    }
    info.classList.add('info')
    // Ajoutez le texte au conteneur SVG
    document.querySelector(".cercle").appendChild(info)

  }

  /**
   * Gère l'effet lorsque l'on quitte la section du graph
   * @param {number} k Index de l'élément survolé
   */
  handlePathOut(k) {
    this.labels[k]?.classList.remove('is-active')
    const info = document.querySelector(".info")
    document.querySelector(".cercle").removeChild(info)
  }

  /**
   * Positionne le label en fonction de l'angle
   * @param {HTMLDivElement|undefined} label 
   * @param {number} angle 
   */
  positionLabel(label, angle) {
    if (!label || !angle) {
      return;
    }
    const point = Point.fromAngle(angle)
    label.style.setProperty('top', `${(point.y * 0.5 + 0.5) * 100}%`)
    label.style.setProperty('left', `${(point.x * 0.5 + 0.5) * 100}%`)
  }
}

customElements.define('pie-chart', PieChart)
