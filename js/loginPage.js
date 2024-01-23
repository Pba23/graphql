const accessToken = localStorage.getItem('accessToken');
// async function submitForm() {
//     const username = document.getElementsByName('username')[0].value;
//     const password = document.getElementsByName('password')[0].value;

//     // Création des en-têtes pour l'authentification basique (Base64)
//     const base64Credentials = btoa(`${username}:${password}`);
//     const headers = new Headers({
//       'Authorization': `Basic ${base64Credentials}`,
//       'Content-Type': 'application/json',
//     });

//     // Requête pour obtenir le JWT depuis le point de terminaison signin
//     const response = await fetch('https://learn.zone01dakar.sn/api/auth/signin', {
//       method: 'POST',
//       headers: headers,
//     });

//     if (response.ok) {
//       const data = await response.json();
//       const token = data.token;
//       if (accessToken){
//         token = accessToken
//       }
//       // Utilisation du token pour effectuer une requête GraphQL authentifiée
//       const graphqlResponse = await fetchGraphQL(token);

//       // Vous pouvez traiter la réponse GraphQL ici
//       // console.log(graphqlResponse);
//     } else {
//       // Gestion des erreurs d'authentification
//       console.error('Authentication failed');
//     }
//   }



const count = 0
export async function submitForm() {
  const username = document.getElementsByName('username')[0].value;
  const password = document.getElementsByName('password')[0].value;

  // Création des en-têtes pour l'authentification basique (Base64)
  const base64Credentials = btoa(`${username}:${password}`);
  const headers = new Headers({
    'Authorization': `Basic ${base64Credentials}`,
    'Content-Type': 'application/json',
  });

  // Requête pour obtenir le JWT depuis le point de terminaison signin
  const response = await fetch('https://learn.zone01dakar.sn/api/auth/signin', {
    method: 'POST',
    headers: headers,
  });

  if (response.ok || accessToken) {

    const token = await response.json();

    localStorage.setItem('accessToken', token);
    const graphqlResponse = await fetchGraphQL(token);
    if (graphqlResponse?.data) {
      window.location.href = "../template/profil.html"
    } else {
      let errorElement = document.querySelector(".message_error");
      if (!errorElement) {
        console.error('Authentication failed');
        const text = document.createElement("label")
        text.classList.add("message_error")
        text.innerHTML = 'Incorrect password or identifiants'
        document.querySelector(".error").appendChild(text)
      }
    }
  } else {
    // Gestion des erreurs d'authentification
    let errorElement = document.querySelector(".message_error");
    if (!errorElement) {
      console.error('Authentication failed');
      const text = document.createElement("label")
      text.classList.add("message_error")
      text.innerHTML = 'Incorrect password or identifiants'
      document.querySelector(".error").appendChild(text)
    }
  }
}


export async function fetchGraphQL(token) {
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



// Données du graphique à barres (exemple)
